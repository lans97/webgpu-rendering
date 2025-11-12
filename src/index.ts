import { mat4, vec3 } from "gl-matrix";
import { Application } from "./core/application";
import { BufferElement, BufferLayout, IndexBuffer, ShaderDataType, VertexBuffer } from "./renderer/buffer";
import { ShaderBuilder } from "./renderer/shader";
import { UniformBuffer } from "./renderer/uniform-buffer";

console.log("Hello This is a Typescript project.");

const vertices = new Float32Array([
//   x,    y,    z,   r,   g,   b,
  -0.5, -0.5, -0.5, 1.0, 0.0, 0.0,// 0: └
  -0.5,  0.5, -0.5, 0.0, 1.0, 0.0,// 1: ┌
   0.5,  0.5, -0.5, 0.0, 0.0, 1.0,// 2: ┐
   0.5, -0.5, -0.5, 1.0, 1.0, 1.0,// 3: ┘
  -0.5, -0.5,  0.5, 1.0, 0.0, 0.0,// 4: └
  -0.5,  0.5,  0.5, 0.0, 1.0, 0.0,// 5: ┌
   0.5,  0.5,  0.5, 0.0, 0.0, 1.0,// 6: ┐
   0.5, -0.5,  0.5, 1.0, 1.0, 1.0,// 7: ┘
]);

const indices = new Uint32Array([
  0, 1, 3, 3, 1, 2,
  3, 2, 7, 7, 2, 6,
  7, 6, 4, 4, 6, 5,
  4, 5, 0, 0, 5, 1,
  1, 5, 2, 2, 5, 6,
  4, 0, 7, 7, 0, 3,
])

async function main() {
  const app = await Application.create("Hello Triangle")
  const renderer = app.renderer;
  const device = app.renderer.device;

  const tvbo = new VertexBuffer(device, vertices);
  tvbo.bufferLayout = new BufferLayout([
    new BufferElement("position", ShaderDataType.Float3),
    new BufferElement("color", ShaderDataType.Float3)
  ]);

  const ibo = new IndexBuffer(device, indices);

  const identity = mat4.create();
  let model = mat4.create();
  let view = mat4.create();
  let projection = mat4.create();

  mat4.rotate(model, identity, -55.0, vec3.fromValues(1.0, 0.0, 0.0));
  mat4.translate(view, identity, vec3.fromValues(0.0, 0.0, -3.0));
  mat4.perspective(projection, 45.0, window.innerWidth/window.innerHeight, 0.1, 100.0);

  const mub = new UniformBuffer(device, 16 * 3 * Float32Array.BYTES_PER_ELEMENT, 0, 0);

  const bufferData = new Float32Array(16 * 3);

  bufferData.set(model, 0);
  bufferData.set(view, 16);
  bufferData.set(projection, 32);

  mub.setData(bufferData);

  const vert = await ShaderBuilder.create(device)
    .fromFile("simple.wgsl")
    .withEntryPoint("vertex_main")
    .withStage(GPUShaderStage.VERTEX)
    .build();

  const frag = await ShaderBuilder.create(device)
    .fromFile('simple.wgsl')
    .withEntryPoint("fragment_main")
    .withStage(GPUShaderStage.FRAGMENT)
    .build();

  function frame(deltaTime: number) {
    renderer.beginFrame()
    renderer.drawIndexed(tvbo, ibo, vert, frag, mub)
    renderer.endFrame()
  }
  app.setOnDraw(frame)

  app.run();
}

document.addEventListener("DOMContentLoaded", main);
