
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
let coordsLoc = gl.getAttribLocation(shaderProgram, "a_TexCoords");


// Create buffer
let buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
let halfl = 0.5;
let spots = new Float32Array([
    halfl, halfl, 1.0, 1.0,
    halfl, -halfl, 1.0, 0.0,
    -halfl, halfl, 0.0, 1.0,
    -halfl, -halfl, 0.0, 0.0,
]);
let FSIZE = spots.BYTES_PER_ELEMENT;
gl.bufferData(gl.ARRAY_BUFFER, spots, gl.STATIC_DRAW);

gl.vertexAttribPointer(attrloc, 2, gl.FLOAT, false, FSIZE*4, 0);
gl.enableVertexAttribArray(attrloc);

gl.vertexAttribPointer(coordsLoc, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2);
gl.enableVertexAttribArray(coordsLoc);


// Textrue
let texture = gl.createTexture(); // Create Textrue
let textureLoc = gl.getUniformLocation(shaderProgram, 'u_texture');
// Get location

let image = new Image();
image.src = '/hello.png';
image.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Sending data
    gl.uniform1i(textureLoc, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};


let matrix = new Matrix4();
matrix.rotate(-45, 1, 0, 0);
matrix.rotate(-45, 0, 0, 1);
let matrixLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
gl.uniformMatrix4fv(matrixLocation, false, matrix.elements);
// gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);



let last_time = Date.now();
let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();

    matrix.rotate(-60/1000*d, 0, 1, 0);
    gl.uniformMatrix4fv(matrixLocation, false, matrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    console.log('FPS:'+d);
    console.log(matrix.elements);


    requestAnimationFrame(move);
}
// move();




