import { Application } from "./core/application";
import { BufferElement, BufferLayout, IndexBuffer, ShaderDataType, VertexBuffer } from "./renderer/buffer";
import { Shader, ShaderBuilder } from "./renderer/shader";

console.log("Hello This is a Typescript project.");

let start = performance.now();

const vertices = new Float32Array([
  //  x,    y,   r,   g,   b,
    -0.5, -0.5, 1.0, 0.0, 0.0,// 0: └
    -0.5,  0.5, 0.0, 1.0, 0.0,// 1: ┌
     0.5,  0.5, 0.0, 0.0, 1.0,// 2: ┐
     0.5, -0.5, 1.0, 1.0, 1.0,// 3: ┘
]);

const indices = new Uint32Array([
  0, 1, 3, 3, 1, 2
])

async function main() {
  const app = await Application.create("Hello Triangle")
  const renderer = app.renderer;
  const device = app.renderer.device;

  const tvbo = new VertexBuffer(device, vertices);
  tvbo.bufferLayout = new BufferLayout([
    new BufferElement("position", ShaderDataType.Float2),
    new BufferElement("color", ShaderDataType.Float3)
  ]);

  const ibo = new IndexBuffer(device, indices);

  const vert = await ShaderBuilder.create(device)
    .fromFile("shader.wgsl")
    .withEntryPoint("vertex_main")
    .withStage(GPUShaderStage.VERTEX)
    .build();

  const frag = await ShaderBuilder.create(device)
    .fromFile('shader.wgsl')
    .withEntryPoint("fragment_main")
    .withStage(GPUShaderStage.FRAGMENT)
    .build();

  function draw(deltaTime: number) {
    renderer.beginFrame()
    renderer.drawIndexed(tvbo, ibo, vert, frag)
    renderer.endFrame()
  }
  app.setOnDraw(draw)

  app.run();
}

document.addEventListener("DOMContentLoaded", main);
