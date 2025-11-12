import { BufferLayout, IndexBuffer, VertexBuffer } from "./buffer";
import { Shader } from "./shader";
import { UniformBuffer } from "./uniform-buffer";

export class RenderPipeline {
  pipeline: GPURenderPipeline;
  label: string = "Render Pipeline";
  constructor(
    device: GPUDevice,
    vertex: Shader,
    layout: BufferLayout,
    fragment: Shader | null = null,
    topology: GPUPrimitiveTopology,
    label: string | null,
    pipelineLayout: GPUPipelineLayout | "auto" = "auto",
  ) {
    if (label) this.label = label;
    const format = navigator.gpu.getPreferredCanvasFormat();
    const vblayout = layout.getGPUVertexLayout();
    const descriptor: GPURenderPipelineDescriptor = {
      layout: pipelineLayout,
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

  drawIndexed(pass: GPURenderPassEncoder, vbo: VertexBuffer, ibo: IndexBuffer, ubo: UniformBuffer | null = null) {
    pass.setVertexBuffer(0, vbo.buffer);
    pass.setIndexBuffer(ibo.buffer, 'uint32');
    if (ubo != null) pass.setBindGroup(0, ubo.bindGroup);
    pass.drawIndexed(ibo.count);
  }
}
