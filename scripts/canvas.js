
let gl = document.getElementsByClassName('ctx').item(0).getContext('webgl');


function getShader(e, GL_ctx) {
    let dom = document.getElementById(e);
    let shader;
    if(dom.type === 'x-shader/x-vertex') {
        shader = GL_ctx.createShader(gl.VERTEX_SHADER);
    } else if(dom.type === 'x-shader/x-fragment') {
        shader = GL_ctx.createShader(gl.FRAGMENT_SHADER);
    }
    GL_ctx.shaderSource(shader, dom.text);
    GL_ctx.compileShader(shader);
    if(GL_ctx.getShaderParameter(shader, gl.COMPILE_STATUS) === true)
        return shader;
    else
        (console.log( GL_ctx.getShaderInfoLog(shader)));
}

let shaderProgram = gl.createProgram();


gl.attachShader(shaderProgram, getShader('Shader-vs', gl));
gl.attachShader(shaderProgram, getShader('Shader-fs', gl));

gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

let attrloc = gl.getAttribLocation(shaderProgram, "pos");
let coloc = gl.getAttribLocation(shaderProgram, "color");


// Create buffer
// let buf = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, buf);
// let halfl = -2;
// let spots = new Float32Array([
//     halfl, halfl, 0.0, 1.0, 1.0,
//     halfl, -halfl, 0.0, 1.0, 0.0,
//     -halfl, halfl, 0.0, 0.0, 1.0,
//     -halfl, -halfl, 0.0, 0.0, 0.0,
//     halfl, halfl, -1.4, 1.0, 1.0,
//     halfl, -halfl, -1.4, 1.0, 0.0,
//     -halfl, halfl, -1.4, 0.0, 1.0,
//     -halfl, -halfl, -1.4, 0.0, 0.0,
// ]);

// NOTE:Cube
// Vertex origin data
var vertices = new Float32Array([   // Vertex coordinates
   1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
   1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
   1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
  -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
  -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
   1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
]);

var colors = new Float32Array([     // Colors
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0   // v4-v7-v6-v5 back(white)
]);

var normals = new Float32Array([    // Normal
  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
  0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
  0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
  0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
]);

var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(attrloc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(attrloc);

var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.vertexAttribPointer(coloc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coloc);

var vBuffer = gl.createBuffer();
let normLoc = gl.getAttribLocation(shaderProgram, "a_normal");
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normLoc);

// Vertex remap index
let vmapBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
let vmapData = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
]);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vmapData, gl.STATIC_DRAW);





// Textrue
// let texture = gl.createTexture(); // Create Textrue
// let textureLoc = gl.getUniformLocation(shaderProgram, 'u_texture');
// Get location

// let image = new Image();
// image.src = './hello.png';
// image.onload = () => {
//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     // Configure
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//     // Sending data
//     gl.uniform1i(textureLoc, 0);
//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Render
//     gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4); // Render
// };

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
// gl.enable(gl.POLYGON_OFFSET_FILL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

let model = new Matrix4();
// model.rotate(-45, 1, 0, 0);
// model.rotate(-45, 0, 0, 1);

let view = new Matrix4();
// view.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
view.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);


let proje = new Matrix4();
proje.setPerspective(30, 1, 1, 100);

let modelLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
let viewLocation = gl.getUniformLocation(shaderProgram, 'u_ViewMatrix');
let projeLocation = gl.getUniformLocation(shaderProgram, 'u_ProjeMatrix');
gl.uniformMatrix4fv(modelLocation, false, model.elements);
gl.uniformMatrix4fv(viewLocation, false, view.elements);
gl.uniformMatrix4fv(projeLocation, false, proje.elements);
// Light uniform
let lightColorLoc = gl.getUniformLocation(shaderProgram, "u_lightColor");
gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0);
let lightDirectionLoc = gl.getUniformLocation(shaderProgram, "u_lightDirection");
let ld = new Vector3([0.5, 3.0, 4.0]);
ld.normalize();
gl.uniform3fv(lightDirectionLoc, ld.elements);

// Normal Matrix
let nm = new Matrix4();
let nmLoc = gl.getUniformLocation(shaderProgram, "u_normalMatrix");
nm.setInverseOf(model);
nm.transpose();
gl.uniformMatrix4fv(nmLoc, false, nm.elements);

let ambLoc = gl.getUniformLocation(shaderProgram, "u_ambientLight");
gl.uniform3f(ambLoc, 0.2, 0.2, 0.2);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);


let last_time = Date.now();
let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    model.rotate(-60/1000*d, 0, 1, 0);
    // matrix.translate(0, 0, -1/1000*d);
    gl.uniformMatrix4fv(modelLocation, false, model.elements);
    gl.uniformMatrix4fv(viewLocation, false, view.elements);
    gl.uniformMatrix4fv(projeLocation, false, proje.elements);
    nm.setInverseOf(model);
    nm.transpose();
    gl.uniformMatrix4fv(nmLoc, false, nm.elements);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0); // Render

    console.log('FPS:'+Math.floor(1000/d));


    requestAnimationFrame(move);
}
// move();
