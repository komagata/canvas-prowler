function Point(x, y) {
  this.x = x
  this.y = y
}

function Game(canvas) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.nodes = []
  this.fps = 24
  this.click = new Point(0, 0)
  this.player = null
  var self = this
  canvas.onclick = function(evt){ self.onclick(evt) }
}
Game.prototype = {
  add: function(node) {
    node.game = this
    this.nodes.push(node)
  },
  addPlayer: function(player) {
    this.player = player
    this.add(player)
  },
  onenterframe: function() {
    this.draw()
    for (var i = 0; i < this.nodes.length; i++)
      this.nodes[i].onenterframe()
  },
  draw: function() {
    this.context.beginPath()
    this.context.fillStyle = 'rgb(128, 128, 128)'
    this.context.fillRect(0, 0, 256, 256)
  },
  start: function() {
    var self = this
    window.setInterval(function(){
      self.onenterframe()
    }, 1000 / self.fps)
  },
  onclick: function(evt) {
    var IE='\v'=='v'
    var x = IE ? event.offsetX : (evt.offsetX || evt.layerX)
    var y = IE ? event.offsetY : (evt.offsetY || evt.layerY)
    this.player.buildPath(new Point(x, y))
  }
}

function Sprite() {
  this.game = null
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
  this.distance = 2
  this.path = []
}
Hunter.prototype = new Sprite
Hunter.prototype.draw = function() {
  var img = new Image
  img.src = this.src[this.dir]
  this.game.context.drawImage(img, this.x, this.y)
}
Hunter.prototype.onenterframe = function() {
  for (var i = 0; i < this.distance; i++) {
    if (this.path.length > 0) {
      var p = this.path.shift()
      this.x = p.x
      this.y = p.y
    }
  }
  this.draw()
}
Hunter.prototype.buildPath = function(destP) {
  var nextX = this.x
  var nextY = this.y
  var deltaX = destP.x - this.x
  var deltaY = destP.y - this.y
  var stepX, stepY
  var step = 0
  var fraction = 0
  this.path = []

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

  if (deltaX <= deltaY) {
    if (this.y < destP.y) this.dir = 's'
    if (this.y > destP.y) this.dir = 'n'
  } else {
    if (this.x < destP.x) this.dir = 'e'
    if (this.x > destP.x) this.dir = 'w'
  }

  this.path[step] = new Point(nextX, nextY)
  step++

  if (deltaX > deltaY) {
    fraction = deltaY - deltaX / 2;
    while (nextX != destP.x) {
      if (fraction >= 0) {
        nextY += stepY
        fraction -= deltaX
      }
      nextX += stepX
      fraction += deltaY
      this.path[step] = new Point(nextX, nextY)
      step++
    }
  } else {
    fraction = deltaX - deltaY / 2
    while (nextY != destP.y) {
      if (fraction >= 0) {
        nextX += stepX
        fraction -= deltaY
      }
      nextY += stepY
      fraction += deltaX
      this.path[step] = new Point(nextX, nextY)
      step++
    }
  }
}
