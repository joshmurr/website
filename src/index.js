import { mat4, vec3, vec4, quat } from 'gl-matrix';
import teapot from './teapot.js';

let canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let WIDTH, HEIGHT;

let projMat = mat4.create();
const FOV = 0.25 * Math.PI;

let modelMat = mat4.create();
const BASE_OPTS = {
  rotation: quat.create(),
  translation: vec3.fromValues(0, 0, -20),
  scale: vec3.fromValues(2, 2, 2),
  origin: vec3.fromValues(0, -0.5, 0),
};

let MP = mat4.create();

// MOSUE
let oldX, oldY, oldT, dX, dY, dT;
let vel = 0;

let mouseOnCard = false;
let counter = 0;

const card = document.getElementById('card');

function updateMouse(e) {
  dX = e.pageX - oldX;
  dY = e.pageY - oldY;
  dT = e.timeStamp - oldT;
  oldX = e.pageX;
  oldY = e.pageY;
  oldT = e.timeStamp;
  vel = (dX * dX + dY * dY) / (dT * dT);
  e.preventDefault();
}

function init() {
  updateScreen();
  requestAnimationFrame(draw);
}

function updateModelMatrix(opts) {
  Object.assign(BASE_OPTS, opts);
  mat4.fromRotationTranslationScaleOrigin(
    modelMat,
    BASE_OPTS.rotation,
    BASE_OPTS.translation,
    BASE_OPTS.scale,
    BASE_OPTS.origin
  );
}

function updateScreen() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  const aspect = WIDTH / HEIGHT;
  mat4.perspective(projMat, FOV, aspect, 1, 100);
}

function NDC(vec) {
  return vec4.fromValues(vec[0] / vec[3], vec[1] / vec[3], vec[2] / vec[3], 1);
}

function draw(now) {
  ctx.fillStyle = 'lightgray';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'black';
  let xRange, yRange, zRange, xScreen, yScreen;

  const rotationQuat = quat.create();
  const t = now * 0.01;
  quat.fromEuler(rotationQuat, t, t, t);

  updateModelMatrix({ rotation: rotationQuat });

  mat4.multiply(MP, projMat, modelMat);
  for (let i = 0, numPoints = teapot.length; i < numPoints; i++) {
    const p = teapot[i];
    let tp = vec4.create();
    tp = vec4.transformMat4(tp, p, MP);
    tp = NDC(tp);
    xRange = (tp[0] + 1) * 0.5;
    yRange = 1 - (tp[1] + 1) * 0.5;
    zRange = (tp[2] + 1) * 0.5;

    xScreen = xRange * WIDTH;
    yScreen = yRange * HEIGHT;
    ctx.beginPath();
    ctx.arc(xScreen, yScreen, 10 * ((1 - zRange) * 15), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  if (counter-- == 0 && !mouseOnCard) card.style.opacity = 0;

  requestAnimationFrame(draw);
}

window.onresize = updateScreen;
window.onload = init;
window.onmousemove = () => {
  updateMouse();
  card.style.opacity = 1;
  counter = 100;
};
card.onmouseover = () => {
  mouseOnCard = true;
  card.classList.toggle('pop', true);
};
card.onmouseout = () => {
  mouseOnCard = false;
  card.classList.toggle('pop', false);
};
