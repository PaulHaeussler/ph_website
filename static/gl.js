"use strict";



function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
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
  return undefined;
}


function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // left column front
        -1, -1,
        -1, 1,
        1, -1,
        1, 1,
        -1, 1,
        1, -1
       ]),
       gl.STATIC_DRAW);
  }





async function build() {
    for(const c of document.getElementsByClassName("glcanvas")){
        var gl = c.getContext("webgl2");
        await main(gl, c.id);
    }
}


async function main(gl, name) {
  // Get A WebGL context

  if (!gl) {
    return;
  }

    var vertexShaderSource = ''

    await fetch('/static/' + name + '_vert.glsl')
        .then(response => response.text())
        .then((data) => {
            vertexShaderSource = data
        })


    var fragmentShaderSource = ''

    await fetch('/static/' + name + '_frag.glsl')
        .then(response => response.text())
        .then((data) => {
            fragmentShaderSource = data
        })


  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  // look up uniform locations


  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  // setGeometry(gl);
  setTexcoords(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floating point values
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);

  // Create a texture.
  var texture = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0 + 0);

  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill the texture with a 1x1 blue pixel.
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
  //              new Uint8Array([0, 0, 255, 255]));

  // Asynchronously load an image
  var image = new Image();
  image.src = "/static/" + name + ".png";
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
  });

    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var u_time = gl.getUniformLocation(program, "u_time");
    var u_resolution = gl.getUniformLocation(program, "u_resolution");
    var u_mouse = gl.getUniformLocation(program, "u_mouse");
    var resolution = new Float32Array(2);
    var mousePos = new Float32Array(2);

    function updateMousePosition(e){
      var rect = gl.canvas.getBoundingClientRect();
      mousePos[0] = (e.pageX - rect.left) / rect.width;
      mousePos[1] = (e.pageY - rect.top) / rect.height;
    }
    document.addEventListener('mousemove', updateMousePosition, false );

  drawScene(0);

  window.addEventListener('resize', drawScene);

  // Draw the scene.
  function drawScene(t) {
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    var time = t * 0.001;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    resolution[0] = gl.canvas.getBoundingClientRect().width;
    resolution[1] = gl.canvas.getBoundingClientRect().height;

    gl.uniform1f(u_time, time);
    gl.uniform2fv(u_resolution, resolution);
    gl.uniform2fv(u_mouse, mousePos);


    gl.bindTexture(gl.TEXTURE_2D, texture);


    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 1 * 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene)
  }
}

await build();
