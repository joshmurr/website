import { mat4, vec3, vec4, quat } from 'gl-matrix';
import teapot from './teapot.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;

let projMat = mat4.create();
const fov = {
  upDegrees: 45,
  downDegrees: 45,
  leftDegrees: 45,
  rightDegrees: 45,
};
mat4.perspectiveFromFieldOfView(projMat, fov, 1, 100);

let modelMat = mat4.create();
let rotation = quat.create();
let translation = vec3.fromValues(0, 0, -20);
const s = 5;
let scale = vec3.fromValues(s, s, s);
let origin = vec3.fromValues(0, -0.5, 0);
mat4.fromRotationTranslationScaleOrigin(
  modelMat,
  rotation,
  translation,
  scale,
  origin
);

let MP = mat4.create();
mat4.multiply(MP, projMat, modelMat);

//prettier-ignore
const icosahedron = [
    vec4.fromValues(0.000, 0.000, 1.000, 1),
    vec4.fromValues(0.894, 0.000, 0.447, 1),
    vec4.fromValues(0.276, 0.851, 0.447, 1),
    vec4.fromValues(-0.724, 0.526, 0.447, 1),
    vec4.fromValues(-0.724, -0.526, 0.447, 1),
    vec4.fromValues(0.276, -0.851, 0.447, 1),
    vec4.fromValues(0.724, 0.526, -0.447, 1),
    vec4.fromValues(-0.276, 0.851, -0.447, 1),
    vec4.fromValues(-0.894, 0.000, -0.447, 1),
    vec4.fromValues(-0.276, -0.851, -0.447, 1),
    vec4.fromValues(0.724, -0.526, -0.447, 1),
    vec4.fromValues(0.000, 0.000, -1.000, 1),
];

function updateModelMatrix(mat, angle) {}

function NDC(vec) {
  return vec4.fromValues(vec[0] / vec[3], vec[1] / vec[3], vec[2] / vec[3], 1);
}

function draw(now) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'red';
  let xRange, yRange, zRange, xScreen, yScreen;
  quat.identity(rotation);
  quat.rotateX(rotation, rotation, now * 0.001);
  mat4.fromRotationTranslationScaleOrigin(
    modelMat,
    rotation,
    translation,
    scale,
    origin
  );
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
    ctx.arc(xScreen, yScreen, 10 * ((1 - zRange) * 10), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
//draw();
