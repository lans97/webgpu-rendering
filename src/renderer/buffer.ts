export enum ShaderDataType {
  None = 0,
  Float,
  Float2,
  Float3,
  Float4,
  Mat3,
  Mat4,
  Int,
  Int2,
  Int3,
  Int4,
  Bool,
}

function ShaderDataTypeSize(dataType: ShaderDataType): number {
  switch (dataType) {
    case ShaderDataType.Float:
      return 4;
    case ShaderDataType.Float2:
      return 4 * 2;
    case ShaderDataType.Float3:
      return 4 * 3;
    case ShaderDataType.Float4:
      return 4 * 4;
    case ShaderDataType.Mat3:
      return 4 * 3 * 3;
    case ShaderDataType.Mat4:
      return 4 * 4 * 4;
    case ShaderDataType.Int:
      return 4;
    case ShaderDataType.Int2:
      return 4 * 2;
    case ShaderDataType.Int3:
      return 4 * 3;
    case ShaderDataType.Int4:
      return 4 * 4;
    case ShaderDataType.Bool:
      return 1;
  }

  return 0;
}

function ShaderDataTypeFormat(dataType: ShaderDataType): GPUVertexFormat {
  switch (dataType) {
    case ShaderDataType.Float:
      return "float32";
    case ShaderDataType.Float2:
      return "float32x2";
    case ShaderDataType.Float3:
      return "float32x3";
    case ShaderDataType.Float4:
      return "float32x4";
    case ShaderDataType.Mat3:
      return "float32x3";
    case ShaderDataType.Mat4:
      return "float32x4";
    case ShaderDataType.Int:
      return "uint32";
    case ShaderDataType.Int2:
      return "uint32x2";
    case ShaderDataType.Int3:
      return "uint32x3";
    case ShaderDataType.Int4:
      return "uint32x4";
    case ShaderDataType.Bool:
      return "uint8";
    case ShaderDataType.None:
      throw Error("Type None has no format");
  }
}

export class BufferElement {
  name: string;
  dataType: ShaderDataType;
  size: number;
  offset: number;

  constructor(name: string, dataType: ShaderDataType) {
    this.name = name;
    this.dataType = dataType;
    this.size = ShaderDataTypeSize(dataType);
    this.offset = 0;
  }

  getComponentCount(): number {
    switch (this.dataType) {
      case ShaderDataType.Float:
        return 1;
      case ShaderDataType.Float2:
        return 2;
      case ShaderDataType.Float3:
        return 3;
      case ShaderDataType.Float4:
        return 4;
      case ShaderDataType.Mat3:
        return 3;
      case ShaderDataType.Mat4:
        return 4;
      case ShaderDataType.Int:
        return 1;
      case ShaderDataType.Int2:
        return 2;
      case ShaderDataType.Int3:
        return 3;
      case ShaderDataType.Int4:
        return 4;
      case ShaderDataType.Bool:
        return 1;
    }

    return 0;
  }
}

export class BufferLayout {
  stride: number = 0;
  elements: BufferElement[];

  constructor(elements: BufferElement[]) {
    this.elements = elements;
    this.calculateOffsetAndStride();
  }

  calculateOffsetAndStride() {
    let offset: number = 0;
    this.stride = 0;
    for (var element of this.elements) {
      element.offset = offset;
      offset += element.size;
      this.stride += element.size;
    }
  }

  getGPUVertexLayout(): GPUVertexBufferLayout {
    let loc = 0;
    let atts: GPUVertexAttribute[] = [];
    for (const el of this.elements) {
      if (el.dataType == ShaderDataType.Mat3 || el.dataType == ShaderDataType.Mat4) {
        for (let i = 0; i < ShaderDataTypeSize(el.dataType); i++) {
          atts.push({
            shaderLocation: loc,
            offset: el.offset,
            format: ShaderDataTypeFormat(el.dataType),
          });
          loc++;
        }
      }
      atts.push({
        shaderLocation: loc,
        offset: el.offset,
        format: ShaderDataTypeFormat(el.dataType),
      });
      loc++;
    }

    const layout: GPUVertexBufferLayout = {
      arrayStride: this.stride,
      attributes: atts,
    };
    return layout;
  }
}

export class VertexBuffer {
  _bufferLayout: BufferLayout | null = null;
  buffer: GPUBuffer;

  constructor(device: GPUDevice, vertices: Float32Array) {
    this.buffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(this.buffer.getMappedRange()).set(vertices);
    this.buffer.unmap();
  }

  get bufferLayout(): BufferLayout | null {
    return this._bufferLayout;
  }

  set bufferLayout(layout: BufferLayout) {
    this._bufferLayout = layout;
  }
}

export class IndexBuffer {
  buffer: GPUBuffer;
  _count: number;

  constructor(device: GPUDevice, indices: Uint32Array) {
    this.buffer = device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Uint32Array(this.buffer.getMappedRange()).set(indices);
    this.buffer.unmap();

    this._count = indices.length;
  }

  get count() {
    return this._count;
  }
}
