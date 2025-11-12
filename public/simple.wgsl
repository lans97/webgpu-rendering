struct Matrices {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  proj: mat4x4<f32>
};

@group(0) @binding(0)

var<uniform> matrices: Matrices;

struct VertexOut {
    @builtin(position) pos: vec4f,
    @location(1) color: vec3f
}

@vertex
fn vertex_main(
  @location(0) pos: vec3f,
  @location(1) color: vec3f
) -> VertexOut {
    var output: VertexOut;

    output.pos = matrices.proj * matrices.view * matrices.model * vec4f(pos, 1.0);
    output.color = color;

    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
  return vec4f(fragData.color, 1.0);
}
