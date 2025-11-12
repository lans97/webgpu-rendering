import { BufferLayout, IndexBuffer, VertexBuffer } from "./buffer";
import { Shader } from "./shader";

export class RenderPipeline {
  pipeline: GPURenderPipeline;
  label: string = "Render Pipeline";
  constructor(
    device: GPUDevice,
    vertex: Shader,
    layout: BufferLayout,
    fragment: Shader | undefined,
    topology: GPUPrimitiveTopology,
    label: string | null,
  ) {
    if (label) this.label = label;
    const format = navigator.gpu.getPreferredCanvasFormat();
    const vblayout = layout.getGPUVertexLayout();
    const descriptor: GPURenderPipelineDescriptor = {
      layout: "auto",
      vertex: {
        module: vertex.module,
        entryPoint: vertex.entrypoint,
        buffers: [vblayout],
      },
      primitive: { topology },
    };

    if (fragment) {
      descriptor.fragment = {
        module: fragment.module,
        entryPoint: fragment.entrypoint,
        targets: [{ format }],
      };
    }

    this.pipeline = device.createRenderPipeline(descriptor);
  }

  bind(pass: GPURenderPassEncoder) {
    pass.setPipeline(this.pipeline);
  }

  draw(pass: GPURenderPassEncoder, vbo: VertexBuffer, length: number) {
    pass.setVertexBuffer(0, vbo.buffer);
    pass.draw(length);
  }

  drawIndexed(pass: GPURenderPassEncoder, vbo: VertexBuffer, ibo: IndexBuffer) {
    pass.setVertexBuffer(0, vbo.buffer);
    pass.setIndexBuffer(ibo.buffer, 'uint32');
    pass.drawIndexed(ibo.count);
  }
}
