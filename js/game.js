function Point(x, y) {
  this.x = x
  this.y = y
}

function Stage(canvas) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.nodes = []
  this.fps = 4
  this.click = new Point(0, 0)
  var self = this
  canvas.onclick = function(evt){ self.onclick(evt) }
}
Stage.prototype = {
  add: function(node) {
    node.stage = this
    this.nodes.push(node)
  },
  onenterframe: function() {
    for (var i = 0; i < this.nodes.length; i++)
      this.nodes[i].onenterframe()
  },
  start: function() {
    var self = this
    window.setInterval(function(){
      self.onenterframe()
    }, 1000 / self.fps)
  },
  onclick: function(evt) {
    this.click.x = evt.offsetX
    this.click.y = evt.offsetY
  }
}

function Sprite() {
  this.stage = null
  this.x = 0
  this.y = 0
}
Sprite.prototype = {
  draw: function(){},
  onenterframe: function(){}
}

function Hunter() {
  this.uid = new Date().getTime()
  this.src = {
    n: 'img/hunter_n0.png',
    e: 'img/hunter_e0.png',
    s: 'img/hunter_s0.png',
    w: 'img/hunter_w0.png'
  }
  this.dir = 's'
  this.mx = 2
  this.my = 2
}
Hunter.prototype = new Sprite
Hunter.prototype.draw = function() {
  var img = new Image
  img.src = this.src[this.dir]
  this.stage.context.drawImage(img, this.x, this.y)
}
Hunter.prototype.onenterframe = function() {
  var nextX = this.x
  var nextY = this.y
  var deltaX = this.stage.click.x - this.x
  var deltaY = this.stage.click.y - this.y
  var stepX, stepY
  var step = 0
  var fraction = 0
  var line = []

  if (deltaX < 0) {
    stepX = -1
  } else {
    stepX = 1
  }
  if (deltaY < 0) {
    stepY = -1
  } else {
    stepY = 1
  }

  deltaX = Math.abs(deltaX * 2)
  deltaY = Math.abs(deltaY * 2)

  line[step] = new Point(nextX, nextY)
  step++

  if (deltaX > deltaY) {
    fraction = deltaY - deltaX / 2;
    while (nextX != this.stage.click.x) {
      if (fraction >= 0) {
        nextY += stepY
        fraction -= deltaX
      }
      nextX += stepX
      fraction += deltaY
      line[step] = new Point(nextX, nextY)
      step++
    }
  } else {
    fraction = deltaX - deltaY / 2
    while (nextY != this.stage.click.y) {
      if (fraction >= 0) {
        nextX += stepX
        fraction -= deltaY
      }
      nextY += stepY
      fraction += deltaX
      line[step] = new Point(nextX, nextY)
      step++
    }
  }

  if (line.length > 1) {
    this.x = line[1].x
    this.y = line[1].y
  }

  this.draw()
}

function Tile() {
}
Tile.prototype = new Sprite
Tile.prototype.draw = function() {
  this.stage.context.beginPath()
  this.stage.context.fillStyle = 'rgb(128, 128, 128)'
  this.stage.context.fillRect(0, 0, 256, 256)
}
Tile.prototype.onenterframe = function() {
  this.draw()
}
