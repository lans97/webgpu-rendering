export class Shader {
  module: GPUShaderModule;
  stage: number;
  source: string;
  entrypoint: string;

  constructor(
    module: GPUShaderModule,
    source: string,
    stage: number,
    entrypoint: string,
  ) {
    this.module = module;
    this.stage = stage;
    this.source = source;
    this.entrypoint = entrypoint;
  }
}

export class ShaderBuilder {
  device: GPUDevice;
  module: GPUShaderModule | null = null;
  stage: number | null = null;
  filepath: string | null = null;
  source: string | null = null;
  entrypoint: string | null = null;

  private constructor(device: GPUDevice) {
    this.device = device;
  }

  static create(device: GPUDevice): ShaderBuilder {
    return new ShaderBuilder(device);
  }

  fromFile(filepath: string): ShaderBuilder {
    this.filepath = filepath;
    return this;
  }

  withStage(stage: number): ShaderBuilder {
    this.stage = stage;
    return this;
  }

  withEntryPoint(entrypoint: string): ShaderBuilder {
    this.entrypoint = entrypoint;
    return this;
  }

  fromSource(sourceCode: string): ShaderBuilder{
    this.source = sourceCode;
    return this;
  }

  async build(): Promise<Shader> {
    if (this.filepath != null) {
      const res = await fetch(this.filepath);
      this.source = await res.text();
    } else if (this.source === null) {
      throw Error("Must initialize source code or filepath");
    }

    if (this.stage === null) {
      throw Error("Must define shader stage");
    }

    this.entrypoint = (this.entrypoint) ? this.entrypoint : "main";

    this.module = this.device.createShaderModule({code: this.source});
    return new Shader(this.module, this.source, this.stage, this.entrypoint);
  }
}
