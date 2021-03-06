import { mat4, vec3, vec4, quat } from 'gl-matrix';
import * as Shapes from './shapes.js';
import './styles.css';

let canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let WIDTH,
  HEIGHT,
  SELECT = 0;

const nextShape = () => {
  const keys = Object.keys(Shapes);
  return Shapes[keys[++SELECT % keys.length]];
};

let SHAPE = Shapes.teapot;
let projMat = mat4.create();
const FOV = 0.25 * Math.PI;
let cam = vec4.fromValues(0, 0, 20, 1);

let modelMat = mat4.create();
let MP = mat4.create();
vec4.transformMat4(cam, cam, MP);

// MOUSE
let oldX, oldY; //, oldT, dX, dY, dT, vel = 0;

let mouseOnCard = false;
let counter = 0;

const card = document.getElementById('card');
function updateMouse(e) {
  //dX = e.pageX - oldX;
  //dY = e.pageY - oldY;
  //dT = e.timeStamp - oldT;
  oldX = e.pageX;
  oldY = e.pageY;
  //oldT = e.timeStamp;
  //vel = (dX * dX + dY * dY) / (dT * dT);
  e.preventDefault();
}

function init() {
  updateScreen();
  oldX = WIDTH / 2;
  oldY = HEIGHT / 2;
  requestAnimationFrame(draw);
}

function updateModelMatrix(opts) {
  let BASE_OPTS = {
    rotation: quat.create(),
    translation: vec3.fromValues(0, 0, -20),
    scale: vec3.fromValues(SHAPE.scale, -SHAPE.scale, SHAPE.scale),
    origin: vec3.fromValues(0, SHAPE.offset, 0),
  };
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

function getColorFromDist(vec, origin, min, max, diff) {
  const dist = vec3.dist(vec, origin);
  const col = 200 - Math.floor(((dist - min) / diff) * 200);
  return 'rgb(' + col + ',' + col + ',' + col + ')';
}

let firstRun = true;
let maxDist = 0;
let minDist = 100;
let diffDist = 0;
function draw(now) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  let xRange, yRange, zRange, xScreen, yScreen;

  const rotationQuat = quat.create();
  const t = now * 0.01;
  quat.fromEuler(rotationQuat, oldY * 0.1, oldX * 0.1, t);

  updateModelMatrix({ rotation: rotationQuat });

  mat4.multiply(MP, projMat, modelMat);

  let transformedPoints = SHAPE.vecs.map((p) => {
    let tp = vec4.create();
    vec4.transformMat4(tp, p, MP);
    return tp;
  });

  transformedPoints.sort((a, b) => vec3.dist(a, cam) - vec3.dist(b, cam));

  for (const p of transformedPoints) {
    if (firstRun) {
      let dist = vec3.dist(p, cam);
      // To calculate the min and max distance
      if (maxDist < dist) maxDist = dist;
      if (minDist > dist) minDist = dist;
    } else {
      ctx.fillStyle = getColorFromDist(p, cam, minDist, maxDist, diffDist);
    }
    let p_NDC = NDC(p);
    xRange = (p_NDC[0] + 1) * 0.5;
    yRange = 1 - (p_NDC[1] + 1) * 0.5;
    zRange = (p_NDC[2] + 1) * 0.5;
    xScreen = xRange * WIDTH;
    yScreen = yRange * HEIGHT;

    ctx.beginPath();
    ctx.arc(xScreen, yScreen, 10 * ((1 - zRange) * 15), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  diffDist = maxDist - minDist;
  firstRun = false;

  if (counter-- == 0 && !mouseOnCard) card.style.opacity = 0;
  requestAnimationFrame(draw);
}

window.onresize = updateScreen;
window.onload = init;
window.onmousemove = (e) => {
  updateMouse(e);
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

canvas.addEventListener('click', () => (SHAPE = nextShape()));
