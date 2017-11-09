
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
// let buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, -0.5,0.5, 0.5,0, 0,0.5]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(attrloc);
gl.vertexAttribPointer(attrloc, 2, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.POINTS, 0, 4);


// for(let a = 0; a<100; a++) {
//     gl.vertexAttrib3f(attrloc, a/100, a/100*a/100, a/100);
//     gl.drawArrays(gl.POINTS, 0, 1);
// }





