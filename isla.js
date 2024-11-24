// Obtener el contexto WebGL2
const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("Tu navegador no soporta WebGL2.");
}

// Asegurarse de que el canvas tiene el tamaño correcto
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Función para crear un shader
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compilando el shader: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
}

// Vertex Shader
const vertexShaderSource = `
#version 300 es
in vec4 a_position;
in vec4 a_color;
out vec4 v_color;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
void main() {
  v_color = a_color;
  gl_Position = u_projection * u_view * u_model * a_position;
}
`;

// Fragment Shader
const fragmentShaderSource = `
#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  fragColor = v_color;
}
`;

// Crear los shaders
const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

if (!vertexShader || !fragmentShader) {
  console.error("No se pudieron crear los shaders. Verifica los errores en los shaders.");
  throw new Error("Shaders no creados correctamente.");
}

// Crear el programa de WebGL
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  console.error('Error linking program: ' + gl.getProgramInfoLog(shaderProgram));
  throw new Error("Error al vincular el programa de shaders.");
}

// Usar el programa de shaders
gl.useProgram(shaderProgram);

// Crear los buffers para la geometría (un plano)
const vertices = new Float32Array([
  // Posición       // Color
   1.0,  1.0, 0.0,  1.0, 1.0, 0.0, // arriba derecha (amarillo)
  -1.0,  1.0, 0.0,  1.0, 1.0, 0.0, // arriba izquierda (amarillo)
   1.0, -1.0, 0.0,  1.0, 1.0, 0.0, // abajo derecha (amarillo)
  -1.0, -1.0, 0.0,  1.0, 1.0, 0.0  // abajo izquierda (amarillo)
]);

// Crear el buffer de vértices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Obtener las ubicaciones de los atributos y uniformes
const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");
const projectionLocation = gl.getUniformLocation(shaderProgram, "u_projection");
const viewLocation = gl.getUniformLocation(shaderProgram, "u_view");
const modelLocation = gl.getUniformLocation(shaderProgram, "u_model");

// Habilitar los atributos
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);
gl.enableVertexAttribArray(colorLocation);

// Matrices de transformación (proyección, vista y modelo)
const projectionMatrix = mat4.create();
const viewMatrix = mat4.create();
const modelMatrix = mat4.create();

// Configurar la proyección (perspectiva)
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 10);

// Configurar la vista (cámara)
mat4.lookAt(viewMatrix, [0, 1, 3], [0, 0, 0], [0, 1, 0]);

// Configurar el modelo (posición de la isla)
mat4.identity(modelMatrix);

// Enviar las matrices al shader
gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

// Bucle de renderizado
function render() {
  gl.clearColor(0.5, 0.8, 1.0, 1.0); // Fondo azul (cielo)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Dibujar el plano (isla de arena)
  
  requestAnimationFrame(render); // Llamar a render de forma continua
}

// Iniciar el renderizado
render();