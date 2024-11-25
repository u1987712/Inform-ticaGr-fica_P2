//Gemma Reina, u1987712

var gl, program;
var myIsland, myPlane;
var palm1, palm2, palm3;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 1.4, fovy = 1.4;

function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");

  try {
    return canvas.getContext("webgl2",{antialias:true});
  }
  catch(e) {
  }

  return null;

}

function initShaders() {
    
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
 
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex = gl.getUniformLocation(program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation(program, "projectionMatrix");
  program.displayModeIndex = gl.getUniformLocation(program, "displayMode");
  program.colorAttribute = gl.getAttribLocation(program, "VertexColor");
  gl.enableVertexAttribArray(program.colorAttribute);
}

function initRendering() {

  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.lineWidth(1.5);

}

function initBuffers(model) {
    
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

  model.idBufferIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

  if (model.colors) {
      model.idBufferColors = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferColors);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);
  }
}

function draw(model) {
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  if (model.idBufferColors) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferColors);
      gl.vertexAttribPointer(program.colorAttribute, 3, gl.FLOAT, false, 0, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);

  if (gl.getUniform(program, program.displayModeIndex) === 0) {
      // Wireframe: Dibujar solo los bordes
      for (var i = 0; i < model.indices.length; i += 3) {
          gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
      }
  } else {
      // Color: Dibujar polígonos completos
      gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}


//Isla
function makeIsland(radiusX, radiusY, radiusZ, longitudeBands, latitudeBands) {
  const vertices = [];
  const indices = [];
  const colors = []; // Arreglo para almacenar colores

  for (let lat = 0; lat <= latitudeBands; lat++) {
      const theta = lat * Math.PI / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let long = 0; long <= longitudeBands; long++) {
          const phi = long * 2 * Math.PI / longitudeBands;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          const x = radiusX * cosPhi * sinTheta;
          const y = radiusY * cosTheta;
          const z = radiusZ * sinPhi * sinTheta;

          vertices.push(x, y, z);
          colors.push(0.8, 0.5, 0.2);  // Marrón arena para la isla

          if (lat < latitudeBands && long < longitudeBands) {
              const first = lat * (longitudeBands + 1) + long;
              const second = first + longitudeBands + 1;

              indices.push(first, second, first + 1);
              indices.push(second, second + 1, first + 1);
          }
      }
  }

  return { vertices, indices, colors };
}

//Agua
function makePlane(size) {
  const halfSize = size / 2;
  const vertices = [
      -halfSize, 0.0, -halfSize, 
       halfSize, 0.0, -halfSize,
       halfSize, 0.0,  halfSize,
      -halfSize, 0.0,  halfSize
  ];
  const indices = [
      0, 1, 2,  
      0, 2, 3
  ];
  const colors = [];
  colors.push(0.0, 0.0, 1.0);  // Azul para el agua
  return { vertices, indices, colors };
}

//Palmeras
function makePalmTree(trunkHeight, trunkRadius, leafSize) {
  const trunkVertices = [];
  const trunkIndices = [];
  const leafVertices = [];
  const leafIndices = [];
  const colors = []; // Arreglo para almacenar colores

  const segments = 16;
  for (let i = 0; i <= segments; i++) {
      const angle = i * 2 * Math.PI / segments;
      const x = trunkRadius * Math.cos(angle);
      const z = trunkRadius * Math.sin(angle);

      trunkVertices.push(x, 0, z); 
      trunkVertices.push(x, trunkHeight, z); 
      
      if (i < segments) {
          const first = i * 2;
          const second = (i + 1) * 2;
          const third = first + 1;
          const fourth = second + 1;

          trunkIndices.push(first, second, third);
          trunkIndices.push(second, fourth, third);
      }
  }

  const leafBaseHeight = trunkHeight + 0.2;
  const numLeaves = 6;
  const leafAngleOffset = Math.PI / 6;

  for (let i = 0; i < numLeaves; i++) {
      const angle = (i * 2 * Math.PI) / numLeaves + leafAngleOffset;

      leafVertices.push(Math.cos(angle) * leafSize, leafBaseHeight, Math.sin(angle) * leafSize);
      leafVertices.push(Math.cos(angle + Math.PI / 3) * leafSize * 1.5, leafBaseHeight, Math.sin(angle + Math.PI / 3) * leafSize * 1.5);
      leafVertices.push(Math.cos(angle - Math.PI / 3) * leafSize * 1.5, leafBaseHeight, Math.sin(angle - Math.PI / 3) * leafSize * 1.5);

      const startIndex = leafVertices.length / 3 - 3;
      leafIndices.push(startIndex, startIndex + 1, startIndex + 2);
  }

  const totalVertices = trunkVertices.concat(leafVertices);
  const totalIndices = trunkIndices.concat(leafIndices);
  colors.push(0.0, 1.0, 0.0);  // Verde para las palmeras

  return { vertices: totalVertices, indices: totalIndices, colors };
}




function initPrimitives() {
  myIsland = makeIsland(1.5, 0.2, 1.5, 20, 20);
  initBuffers(myIsland);

  myPlane = makePlane(5.0); // Un plano de 5x5 unidades
  initBuffers(myPlane);

  // Crear palmeras
  palm1 = makePalmTree(0.3, 0.05, 0.1);
  palm2 = makePalmTree(0.35, 0.05, 0.12);
  palm3 = makePalmTree(0.3, 0.04, 0.1);
  initBuffers(palm1);
  initBuffers(palm2);
  initBuffers(palm3);

}

function setProjection() {
    
  // obtiene la matriz de transformación de la proyección perspectiva
  var projectionMatrix  = mat4.create();
  mat4.perspective(projectionMatrix, fovy, 1.0, 0.1, 100.0);
  
  // envía la matriz de transformación de la proyección al shader de vértices
  gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);

}

function getCameraMatrix() {

  var x = radius * Math.sin(myPhi) * Math.sin(myZeta);
  var y = radius * Math.cos(myPhi);
  var z = radius * Math.sin(myPhi) * Math.cos(myZeta);

  return mat4.lookAt(mat4.create(), [x, y, z], [0, 0, 0], [0, 1, 0]);
    
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    setProjection();
    gl.uniform1i(program.displayModeIndex, 0); // Establecer el modo predeterminado (Wireframe)

    // Dibujar el plano (agua)
    var modelMatrix = mat4.create();
    var modelViewMatrix = mat4.create();
    mat4.fromTranslation(modelMatrix, [0, 0, 0]);
    mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
    gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    draw(myPlane);

    // Dibujar la isla
    modelMatrix = mat4.create();
    modelViewMatrix = mat4.create();
    mat4.fromScaling(modelMatrix, [0.5, 0.5, 0.5]);
    mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
    gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    draw(myIsland);

    // Dibujar palmeras
    const palmPositions = [
        [0.1, 0.05, 0.2],   // Palm 1
        [-0.2, 0.05, -0.3], // Palm 2
        [0.3, 0.05, -0.4]   // Palm 3
    ];

    palmPositions.forEach((position, index) => {
        modelMatrix = mat4.create();
        modelViewMatrix = mat4.create();
        mat4.fromTranslation(modelMatrix, position);  // Desplazar la palmera
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        // Selecciona la palmera correspondiente
        switch(index) {
            case 0: draw(palm1); break;
            case 1: draw(palm2); break;
            case 2: draw(palm3); break;
        }
    });
}



function initHandlers() {
    var mouseDown = false;
    var lastMouseX;
    var lastMouseY;

    var canvas     = document.getElementById("myCanvas");
    var htmlPhi    = document.getElementById("Phi");
    var htmlZeta   = document.getElementById("Zeta");
    var htmlRadius = document.getElementById("Radius");
    var htmlFovy   = document.getElementById("Fovy");

    htmlPhi.innerHTML    = (myPhi  * 180 / Math.PI).toFixed(1);
    htmlZeta.innerHTML   = (myZeta * 180 / Math.PI).toFixed(1);
    htmlRadius.innerHTML = radius.toFixed(1);
    htmlFovy.innerHTML   = (fovy * 180 / Math.PI).toFixed(1);

    canvas.addEventListener("mousedown", function(event) {
        mouseDown  = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }, false);

    canvas.addEventListener("mouseup", function() {
        mouseDown = false;
    }, false);

    canvas.addEventListener("wheel", function (event) {
        var delta = 0.0;

        if (event.deltaMode == 0)
            delta = event.deltaY * 0.001;
        else if (event.deltaMode == 1)
            delta = event.deltaY * 0.03;
        else
            delta = event.deltaY;

        if (event.shiftKey == 1) { // fovy
            fovy *= Math.exp(-delta)
            fovy = Math.max (0.1, Math.min(3.0, fovy));
            htmlFovy.innerHTML = (fovy * 180 / Math.PI).toFixed(1);
        } else {
            radius *= Math.exp(-delta);
            radius  = Math.max(Math.min(radius, 30), 0.05);
            htmlRadius.innerHTML = radius.toFixed(1);
        }

        event.preventDefault();
        requestAnimationFrame(drawScene);

    }, false);

    canvas.addEventListener("mousemove", function (event) {
        if (!mouseDown) {
            return;
        }

        var newX = event.clientX;
        var newY = event.clientY;

        myZeta -= (newX - lastMouseX) * 0.005;
        myPhi  -= (newY - lastMouseY) * 0.005;

        var margen = 0.01;
        myPhi = Math.min (Math.max(myPhi, margen), Math.PI - margen);

        htmlPhi.innerHTML  = (myPhi  * 180 / Math.PI).toFixed(1);
        htmlZeta.innerHTML = (myZeta * 180 / Math.PI).toFixed(1);

        lastMouseX = newX
        lastMouseY = newY;

        event.preventDefault();
        requestAnimationFrame(drawScene);

    }, false);

      document.getElementById('wireframe').addEventListener('click', function() {
          gl.uniform1i(gl.getUniformLocation(program, "displayMode"), 0); // Wireframe
          requestAnimationFrame(drawScene);
      });
  
      document.getElementById('color').addEventListener('click', function() {
          gl.uniform1i(gl.getUniformLocation(program, "displayMode"), 1); // Color
          requestAnimationFrame(drawScene);
      });
  
      document.getElementById('normal').addEventListener('click', function() {
          gl.uniform1i(gl.getUniformLocation(program, "displayMode"), 2); // Normal Shader
          requestAnimationFrame(drawScene);
      });
}
       

function initWebGL() {
    
  gl = getWebGLContext();
    
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
    
  initShaders();
  initPrimitives();
  initRendering();
  initHandlers();
  
  requestAnimationFrame(drawScene);
  
}

initWebGL();