const sensor = document.querySelector("#sensor");
const sensorValue = document.querySelector("#sensorValue");
const particle = document.querySelector("#particle");
const particleValue = document.querySelector("#particleValue");
const angleSlime = document.querySelector("#angle");
const angleValue = document.querySelector("#angleValue");
const colorPicker = document.querySelector("#colorPicker");

let scriptActiveSlime = true;
let decay_slime = 0.05;
let abs_speed_slime = 3;
let angle_part_slime = angleSlime.valuea;

(function (w) {
  let numParticlesSlime = particle.value;
  var diff = 0.5;
  var slime_part_shape = 0;
  let angle = angle_part_slime;
  let color = colorPicker.value;
  var theme = 0;
  var isMobileDevice = false;
  var BACKGROUND_COLOR = "rgba(0,0,0,0.1)";
  var PARTICLE_RADIUS = 0.1;
  var mousedown = true;
  var idcanvasSlime,
    canvasSlime,
    contextSlime,
    bufferCvs,
    bufferCtx,
    ww,
    wh,
    offsetX,
    offsetY,
    _particles = [];

  function toggleRenderShape() {
    if (slime_part_shape) slime_part_shape = 0;
    else slime_part_shape = 1;
    return slime_part_shape;
  }

  var V = function (x, y) {
    return new SAT.Vector(x, y);
  };

  function _Particles(x, y, radius, alfa, lambda) {
    this.pos = V(x, y);
    this.radius = radius;
    this.alfa = alfa;
    this.lambda = lambda;
    this.pheromone = 0;
    this._latest = V(0, 0);
    this.setSpeed(abs_speed_slime);
  }

  _Particles.prototype = {
    setSpeed: function (speed) {
      this._speed = V(Math.cos(this.alfa), Math.sin(this.alfa));
      this._speedL = V(
        Math.cos(this.alfa + this.lambda),
        Math.sin(this.alfa + this.lambda)
      );
      this._speedR = V(
        Math.cos(this.alfa - this.lambda),
        Math.sin(this.alfa - this.lambda)
      );
      this._speed.scale(speed);
      this._speedL.scale(speed);
      this._speedR.scale(speed);
    },
    update: function (dir) {
      // Aggiorno direzione
      if (dir == 2) this.alfa -= this.lambda;
      else if (dir == 1) this.alfa += this.lambda;
      if (!dir == 0) this.setSpeed(abs_speed_slime);
      if (this.pos.x + this._speed.x < 0) this.pos.x += ww;
      else if (this.pos.x + this._speed.x > ww) this.pos.x -= ww;
      else if (this.pos.y + this._speed.y < 0) this.pos.y += wh;
      else if (this.pos.y + this._speed.y > wh) this.pos.y -= wh;
      // salvo vecchia posizione
      this._latest = this.pos.clone();
      this.pos.add(this._speed);
    },
  };

  var gridPheromones = [];
  var resolution = 10000;
  var gridStep;
  var gridX = 0;
  var gridY = 0;
  var mouseWidth = 20;

  function initGrid() {
    gridStep = 1;
    for (var stepx = 0, i = 0; stepx < ww; stepx += gridStep, i++) {
      gridPheromones[i] = [];
      gridX = i;
      for (var stepy = 0, j = 0; stepy < ww; stepy += gridStep, j++) {
        gridPheromones[i][j] = 0;
        gridY = j;
      }
    }
  }

  function decayGrid() {
    for (var stepx = 0, i = 0; stepx < ww; stepx += gridStep, i++) {
      for (var stepy = 0, j = 0; stepy < ww; stepy += gridStep, j++) {
        gridPheromones[i][j] = gridPheromones[i][j] * decay_slime;
      }
    }
  }
  function diffuseParticle(i, j, amount) {
    if (i < 0 || j < 0 || i >= ww || j >= wh) return;
    var left = i - 1 < 0 ? ww - 1 : i - 1;
    var right = (i + 1) % (ww - 1);
    var up = j - 1 < 0 ? wh - 1 : j - 1;
    var down = (j + 1) % (wh - 1);
    gridPheromones[left][up] += diff * amount;
    gridPheromones[left][j] += diff * amount;
    gridPheromones[left][down] += diff * amount;
    gridPheromones[right][up] += diff * amount;
    gridPheromones[right][j] += diff * amount;
    gridPheromones[right][down] += diff * amount;
    gridPheromones[i][up] += diff * amount;
    gridPheromones[i][down] += diff * amount;
    gridPheromones[i][j] += amount;
  }

  // chiamare una volta prima dell'initScene
  function initcanvasSlime(id, style) {
    idContainerSlime = id + "Container";
    idcanvasSlime = id;
    canvasSlime = document.getElementById(idcanvasSlime);
    bufferCvs = document.createElement("canvas");

    canvasSlime.addEventListener("mousedown", onMouseDown);
    canvasSlime.addEventListener("mousemove", onMouseMove);
    canvasSlime.addEventListener("touchmove", onTouchMove);
    canvasSlime.addEventListener("mouseup", onMouseUp);
    canvasSlime.addEventListener("mouseout", onMouseUp);
  }

  function onTouchMove(e) {
    if (!scriptActiveSlime) return;
    for (var i = -mouseWidth; i < mouseWidth; i++) {
      for (var j = -mouseWidth; j < mouseWidth; j++) {
        diffuseParticle(
          Math.floor(e.touches[0].clientX + i),
          Math.floor(e.touches[0].clientY + j),
          10000000
        );
      }
    }
  }
  function onTouchDown(e) {
    if (!scriptActiveSlime) return;
    for (var i = -mouseWidth; i < mouseWidth; i++) {
      for (var j = -mouseWidth; j < mouseWidth; j++) {
        diffuseParticle(
          Math.floor(e.touches[0].clientX + i),
          Math.floor(e.touches[0].clientY + j),
          10000000
        );
      }
    }
  }

  function onMouseDown(e) {
    if (!scriptActiveSlime) return;
    for (var i = -mouseWidth; i < mouseWidth; i++) {
      for (var j = -mouseWidth; j < mouseWidth; j++) {
        diffuseParticle(
          e.clientX + i - offsetX,
          e.clientY + j - offsetY,
          10000000
        );
      }
    }
    mousedown = true;
  }
  function onMouseUp() {
    mousedown = false;
  }
  function onMouseMove(e) {
    if (!scriptActiveSlime) return;
    if (mousedown) {
      for (var i = -mouseWidth; i < mouseWidth; i++) {
        for (var j = -mouseWidth; j < mouseWidth; j++) {
          diffuseParticle(
            e.clientX + i - offsetX,
            e.clientY + j - offsetY,
            10000000
          );
        }
      }
    }
  }

  function offsetsSlime(width, height) {
    offsetX = Math.floor((window.innerWidth - width) * 0.5);
    offsetY = Math.floor((window.innerHeight - height) * 0.5);
    ww = canvasSlime.width = width;
    wh = canvasSlime.height = height;

    bufferCvs.width = ww;
    bufferCvs.height = wh;
    contextSlime = canvasSlime.getContext("2d");
    bufferCtx = bufferCvs.getContext("2d");
  }

  function refreshSlime() {
    initSceneSlime(ww, wh);
  }

  particleValue.textContent = numParticlesSlime;
  particle.addEventListener("input", () => {
    numParticlesSlime = particle.value;
    particleValue.textContent = numParticlesSlime;
  });

  // Init
  function initSceneSlime(width, height) {
    clearParticles();

    numParticles = numParticlesSlime;
    offsetsSlime(width, height);

    makeParticles(numParticlesSlime);
    initGrid();
  }

  // Functions

  function makeParticles(num) {
    var i, p;
    for (i = 0; i < num; i++) {
      p = new _Particles(
        Math.floor(ww * Math.random()),
        Math.floor(wh * Math.random()),
        PARTICLE_RADIUS,
        2 * Math.PI * Math.random(),
        angle * Math.PI
      );
      _particles.push(p);
    }
  }

  sensor_slime = sensor.value;
  sensorValue.textContent = sensor_slime;
  sensor.addEventListener("input", () => {
    sensor_slime = sensor.value;
    sensorValue.textContent = sensor_slime;
  });

  function clearParticles() {
    _particles = [];
  }

  function findRoute(p) {
    var xs =
      Math.floor((p.pos.x + sensor_slime * p._speed.x) / gridStep) % gridX;
    if (xs < 0) xs += gridX;
    var ys =
      Math.floor((p.pos.y + sensor_slime * p._speed.y) / gridStep) % gridY;
    if (ys < 0) ys += gridY;

    var xl =
      Math.floor((p.pos.x + sensor_slime * p._speedL.x) / gridStep) % gridX;
    if (xl < 0) xl += gridX;
    var yl =
      Math.floor((p.pos.y + sensor_slime * p._speedL.y) / gridStep) % gridY;
    if (yl < 0) yl += gridY;

    var xr =
      Math.floor((p.pos.x + sensor_slime * p._speedR.x) / gridStep) % gridX;
    if (xr < 0) xr += gridX;
    var yr =
      Math.floor((p.pos.y + sensor_slime * p._speedR.y) / gridStep) % gridY;
    if (yr < 0) yr += gridY;

    var streight = gridPheromones[xs][ys];
    var left = gridPheromones[xl][yl];
    var right = gridPheromones[xr][yr];

    if (left == right) {
      if (!left >= streight) return 0;
      //dritto
      else return Math.floor(2 * Math.random()) + 1;
    } else if (left > right) {
      if (left >= streight) return 1;
      //sx
      else return 0;
    } else {
      if (right >= streight) return 2;
      //dx
      else return 0;
    }
  }

  let anggg = angleSlime.value;

  angleValue.textContent = anggg;
  angleSlime.addEventListener("input", () => {
    anggg = angleSlime.value;
    angleValue.textContent = anggg;
  });

  function loopSlime() {
    if (scriptActiveSlime) {
      if (anggg != angle) {
        angle = anggg;
        refreshSlime();
      }
      var i, len, g, p;
      contextSlime.save();
      contextSlime.fillStyle = BACKGROUND_COLOR;
      contextSlime.fillRect(0, 0, ww, wh);
      contextSlime.restore();

      color = colorPicker.value;
      colorPicker.addEventListener("input", () => {
        color = colorPicker.value;
      });

      var rnd = Math.random();
      bufferCtx.save();
      bufferCtx.globalCompositeOperation = "destination-out";
      bufferCtx.globalAlpha = 1;
      bufferCtx.fillRect(0, 0, ww, wh);
      bufferCtx.restore();
      len = _particles.length;
      bufferCtx.save();
      bufferCtx.fillStyle = bufferCtx.strokeStyle = color;
      bufferCtx.lineCap = bufferCtx.lineJoin = "round";
      bufferCtx.lineWidth =
        slime_part_shape == 0
          ? PARTICLE_RADIUS * (2 + rnd)
          : 3 * PARTICLE_RADIUS * (2 + rnd);
      bufferCtx.beginPath();
      for (i = 0; i < len; i++) {
        p = _particles[i];
        // decido dove andare
        var route = findRoute(p);
        // aggiorno la particella
        p.update(route);
        bufferCtx.moveTo(p.pos.x, p.pos.y);
        if (slime_part_shape == 0) {
          bufferCtx.lineTo(p._latest.x, p._latest.y);
        } else if (slime_part_shape == 1) {
          bufferCtx.lineTo(p.pos.x, p.pos.y);
        }
        // aggiorno la griglia
        diffuseParticle(
          Math.floor(p.pos.x / gridStep) % gridX,
          Math.floor(p.pos.y / gridStep) % gridY,
          1 /*+(p.pheromone*transport)*/
        );
      }
      bufferCtx.stroke();
      bufferCtx.restore();
      contextSlime.drawImage(bufferCvs, 0, 0);

      // dacay griglia
      decayGrid();

      if (numParticles != numParticlesSlime) {
        initSceneSlime(ww, wh);
      }
      requestAnimationFrame(loopSlime);
    }
  }

  w.SlimeMold = {
    initCanvas: initcanvasSlime,
    init: initSceneSlime,
    render: loopSlime,
    offset: offsetsSlime,
    refresh: refreshSlime,
    toggleRenderShape: toggleRenderShape,
  };
})(window);

SlimeMold.initCanvas("canvas");
SlimeMold.init(window.innerWidth, window.innerHeight);
requestAnimationFrame(SlimeMold.render);
window.addEventListener("resize", resize);
function resize() {
  SlimeMold.init(window.innerWidth, window.innerHeight);
}
