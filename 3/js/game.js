function Point(x, y) {
  this.x = x
  this.y = y
}

function make_image(src, width, height) {
  if (width == null || height == null) {
    var img = new Image()
  } else {
    var img = new Image(width, height)
  }
  img.src = src
  return img
}

function Game(placeholder, width, height) {
  this.class_name = 'Game'
  var ph = document.getElementById(placeholder)
  ph.innerHTML = '<canvas id="_canvas" width="'+width+'" height="'+height+'"></canvas>'
  var canvas = document.getElementById('_canvas')
  this.width = width
  this.height = height
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
//    this.context.beginPath()
//    this.context.fillStyle = 'rgb(128, 128, 128)'
//    this.context.fillRect(0, 0, this.width, this.height)
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
    this.player.buildPath(new Point(x - 8, y - 8))
  }
}

function Sprite() {
  this.init.apply(this, arguments)
}
Sprite.prototype = {
  init: function(x, y, width, height) {
    this.class_name = 'Sprite'
    this.game = null
    this.x = x || 0
    this.y = y || 0
    this.width = width || 16
    this.height = height || 16
  },
  draw: function() {},
  onenterframe: function() {}
}

function Hunter(x, y, width, height) {
  this.class_name = 'Hunter'
  this.game = null
  this.is_player = true
  this.is_obstacle = true
  this.x = x || 0
  this.y = y || 0
  this.width = width || 16
  this.height = height || 16
  this.uid = new Date().getTime()
  this.src = {
    n: [make_image('img/hunter_n_0.png', 16, 16),
        make_image('img/hunter_n_1.png', 16, 16)],
    e: [make_image('img/hunter_e_0.png', 16, 16),
        make_image('img/hunter_e_1.png', 16, 16)],
    s: [make_image('img/hunter_s_0.png', 16, 16),
        make_image('img/hunter_s_1.png', 16, 16)],
    w: [make_image('img/hunter_w_0.png', 16, 16),
        make_image('img/hunter_w_1.png', 16, 16)]
  }
  this.dir = 's'
  this.distance = 2
  this.state_interval = 7
  this.path = []
  this.state = 0
  this.buf = 0
}
Hunter.prototype = new Sprite
Hunter.prototype.draw = function() {
  this.game.context.drawImage(
    this.src[this.dir][this.state],
    this.x,
    this.y,
    this.width,
    this.height
  )
}
Hunter.prototype.toggle_state = function() {
  if (this.state == 0) {
    this.state = 1
  } else {
    this.state = 0
  }
}
Hunter.prototype.onenterframe = function() {
  for (var i = 0; i < this.distance; i++) {
    this.move()
  }
  if (this.buf > this.state_interval) {
    this.buf = 0
    this.toggle_state()
  } else {
    this.buf++
  }
  this.draw()
}
Hunter.prototype.move = function() {
  if (this.path.length > 0) {
    if (!this.is_collision(this.path[0])) {
      var p = this.path.shift()
      this.x = p.x
      this.y = p.y
    }
  }
}
Hunter.prototype.is_collision = function(p) {
  var ax1 = p.x
  var ay1 = p.y
  var ax2 = p.x + this.width
  var ay2 = p.y + this.height

  for (var i = 0; i < this.game.nodes.length; i++) {
    var n = this.game.nodes[i]
    if (!n.is_player && n.is_obstacle) {
      var bx1 = n.x
      var by1 = n.y
      var bx2 = n.x + n.width
      var by2 = n.y + n.height

      if (!(ax2 < bx1 || ax1 > bx2 || ay1 > by2 || ay2 < by1)) {
        return true
      }
    }
  }
  return false
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

function Drumcan() {
  this.init.apply(this, arguments)
}
Drumcan.prototype = Sprite.prototype
Drumcan.prototype.init = function(x, y, width, height) {
  this.class_name = 'Drumcan'
  this.game = null
  this.is_player = false
  this.is_obstacle = true
  this.x = x || 0
  this.y = y || 0
  this.width = width || 16
  this.height = height || 16
  this.img = make_image('img/drumcan.png', 16, 16)
}
Drumcan.prototype.draw = function() {
  this.game.context.drawImage(this.img, this.x, this.y, this.width, this.height)
}
Drumcan.prototype.onenterframe = function() {
  this.draw()
}

function Tile(x, y, width, height) {
  this.class_name = 'Tile'
  this.game = null
  this.is_player = false
  this.is_obstacle = false
  this.x = x || 0
  this.y = y || 0
  this.width = width || 320
  this.height = height || 320
  this.img = make_image('img/tile.png', 320, 320)
  this.draw = function() {
    this.game.context.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
  this.onenterframe = function () {
    this.draw()
  }
}
