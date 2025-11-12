struct VertexOut {
    @builtin(position) pos: vec4f,
    @location(1) color: vec3f
}

@vertex
fn vertex_main(
  @location(0) pos: vec2f,
  @location(1) color: vec3f
) -> VertexOut {
    var output: VertexOut;

    output.pos = vec4f(pos, 0.0, 1.0);
    output.color = color;

    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
  return vec4f(fragData.color, 1.0);
}
