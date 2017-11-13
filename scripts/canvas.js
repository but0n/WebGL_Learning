
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



// Create buffer
let buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
let halfl = 0.4;
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    halfl, halfl, halfl,
    halfl, -halfl, halfl,
    -halfl, -halfl, halfl,
    -halfl, halfl, halfl,

    halfl, halfl, -halfl,
    halfl, -halfl, -halfl,
    -halfl, -halfl, -halfl,
    -halfl, halfl, -halfl
]), gl.STATIC_DRAW);
gl.vertexAttribPointer(attrloc, 3, gl.FLOAT, false, 0, 0);

gl.enableVertexAttribArray(attrloc);


let matrix = new Matrix4();

matrix.rotate(-30 , 1, 0, 0);

let matrixLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
gl.uniformMatrix4fv(matrixLocation, false, matrix.elements);
gl.drawArrays(gl.LINE_LOOP, 0, 8);

function move() {
    let matrix = new Matrix4();
    matrix.setScale(0.8, 0.8, 0.8);
    matrix.rotate(-30 , 1, 0, 0);

    for(let a = 0; a<20; a++) {
        matrix.rotate(1, 0, 1, 0);
        matrix.translate(0, 0, 0);

        gl.uniformMatrix4fv(matrixLocation, false, matrix.elements);
        gl.drawArrays(gl.LINE_LOOP, 0, 8);
    }
}





