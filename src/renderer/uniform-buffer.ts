export class UniformBuffer {
  buffer: GPUBuffer;
  size: number;
  group: number;
  binding: number;
  device: GPUDevice;
  bindGroup: GPUBindGroup;

  constructor(device: GPUDevice, size: number, binding: number, group: number) {
    this.device = device;
    this.size = size;
    this.group = group;
    this.binding = binding;
    this.buffer = this.device.createBuffer({
      size: this.size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.bindGroup = this.createBindGroup();
  }

  setData(data: Float32Array) {
    this.device.queue.writeBuffer(
      this.buffer,
      0,
      data.buffer,
      data.byteOffset,
      data.byteLength,
    );
  }

  private createBindGroup(): GPUBindGroup {
    const bgLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: this.binding,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });

    const bg = this.device.createBindGroup({
      layout: bgLayout,
      entries: [
        {
          binding: this.binding,
          resource: { buffer: this.buffer },
        },
      ],
    });

    return bg;
  }
}
