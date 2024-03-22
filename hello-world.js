
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function startup() {
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    console.warn('no webgl context !')
    return;
  }
  var vertexShaderSource = `#version 300 es
  in vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 clipSpace = (a_position/u_resolution)* 2.0  - 1.0;
    gl_Position = vec4(clipSpace, 0, 1);
  }
  `;

  var fragmentShaderSource = `#version 300 es
  precision highp float;
  out vec4 outColor;
  void main() {
    outColor = vec4(1, 0, 0.5, 1);
  }
  `;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  //
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // three 2d points
  var positions = [
    100, 100,
    100, 200,
    300, 100,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionAttributeLocation);

  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);

}