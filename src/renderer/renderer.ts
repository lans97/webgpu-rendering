import { vec4 } from "gl-matrix";
import { IndexBuffer, VertexBuffer } from "./buffer";
import { RenderPipeline } from "./pipeline";
import { Shader } from "./shader";
import { UniformBuffer } from "./uniform-buffer";

export class Renderer {
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  encoder: GPUCommandEncoder | undefined;
  pass: GPURenderPassEncoder | undefined;
  textureFormat: GPUTextureFormat;

  _clearColor: vec4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

  onDraw: (deltaTime: number) => void = (deltaTime: number) => {
    console.log("Default draw");
    console.log(`Delta time: ${deltaTime}`);
  };

  private constructor(
    canvas: HTMLCanvasElement,
    device: GPUDevice,
    context: GPUCanvasContext,
  ) {
    this.canvas = canvas;
    this.device = device;
    this.context = context;
    this.textureFormat = navigator.gpu.getPreferredCanvasFormat();

    this.setViewport(window.innerWidth, window.innerHeight);
  }

  static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
    if (!navigator.gpu) {
      throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error("Could not request WebGPU adapter.");
    }

    const device = await adapter.requestDevice();
    if (!device) {
      throw Error("Could not get device.");
    }

    const context = canvas.getContext("webgpu");
    if (!context) {
      throw Error("Browser does not support WebGPU.");
    }

    return new Renderer(canvas, device, context);
  }

  setViewport(width: number, height: number) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.context.configure({
      device: this.device,
      format: this.textureFormat,
      alphaMode: "premultiplied",
    });
  }

  set clearColor(color: vec4) {
    this._clearColor = color;
  }

  beginFrame() {
    this.encoder = this.device.createCommandEncoder();
    this.pass = this.encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: [this._clearColor[0], this._clearColor[1], this._clearColor[2], this._clearColor[3]],
          storeOp: "store",
        },
      ],
    });
  }

  endFrame() {
    if (this.pass == undefined || this.encoder == undefined) {
      throw Error("Frame uninitialized");
    }
    this.pass.end();
    this.device.queue.submit([this.encoder.finish()]);
  }

  drawIndexed(
    vbo: VertexBuffer,
    ibo: IndexBuffer,
    vs: Shader,
    fs: Shader | null = null,
    ubo: UniformBuffer | null = null,
  ) {
    const pl = new RenderPipeline(
      this.device,
      vs,
      vbo.bufferLayout!,
      fs,
      "triangle-list",
      "render lines",
    );
    if (!this.pass) {
      throw Error("Frame uninitialized");
    }

    pl.bind(this.pass);
    pl.drawIndexed(this.pass, vbo, ibo, ubo);
  }

  drawLines(vbo: VertexBuffer, length: number, vs: Shader, fs: Shader | undefined) {
    const pl = new RenderPipeline(
      this.device,
      vs,
      vbo.bufferLayout!,
      fs,
      "line-list",
      "render lines",
    );
    if (!this.pass) {
      throw Error("Frame uninitialized");
    }

    pl.bind(this.pass);
    pl.draw(this.pass, vbo, length);
  }
}
