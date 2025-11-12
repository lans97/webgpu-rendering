namespace GLFT {
  export interface Asset {
    version: number;
    minVersion: number | null;
    generator: string | null;
    copyright: string | null;
  }

  export interface Buffer {
    name: string | null;
    byteLength: number;
    uri: string;
  }

  export interface BufferView {
    name: string | null;
    buffer: number;
    byteLength: number;
    byteOffset: number;
  }

  export interface Node {
    name: string | null;
  }

  export interface Scene {
    name: string | null;
    nodes: number[];
  }

  export interface Gltf {
    asset: Asset;
    buffers: Buffer[];
    bufferViews: BufferView[];
    nodes: Node[];
    scenes: Scene[] | null;
    scene: number | null;
  }
}
