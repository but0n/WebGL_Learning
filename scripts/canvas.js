
let gl = document.getElementsByClassName('ctx').item(0).getContext('webgl');

let rad = 1;
let sigma = rad*3.3;
let sigma2 = 2.0 * sigma * sigma;
let sigmap = sigma2 * Math.PI;
let wsum = 0;
let result = [];
for(let i = -rad; i <= rad; i++) {
    for(let j = -rad; j <= rad; j++) {
        let w = Math.exp(-(i*i + j*j) / sigma2) / sigmap;
        wsum += w;
    }
}
console.log('sum:\t' + wsum);
for(let i = -rad; i <= rad; i++) {
    for(let j = -rad; j <= rad; j++) {
        let w = Math.exp(-(i*i + j*j) / sigma2) / sigmap / wsum;
        if(j>=0 && i>=0) {
            console.log('('+j+','+i+')\t' + w);
            result.push(w);}
    }
    console.log('\n');
}
console.log(result);


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

function attributeBuffer(pointer, data, n, type) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointer, n, type, false, 0, 0);
    gl.enableVertexAttribArray(pointer);
}

let shaderProgram = gl.createProgram();


gl.attachShader(shaderProgram, getShader('Shader-vs', gl));
gl.attachShader(shaderProgram, getShader('Shader-fs', gl));

gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// let coloc = gl.getAttribLocation(shaderProgram, "a_Color");

let mod = GenerateModel(1.8, 0.8, 300);
let vertices = mod.vertices;
let normals = mod.normals;
let colors = mod.color;
let texCs = mod.texCoords;

shaderProgram.a_Position= gl.getAttribLocation(shaderProgram, "a_Position");
attributeBuffer(shaderProgram.a_Position, vertices, 3, gl.FLOAT);

shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, "a_Normal");
attributeBuffer(shaderProgram.a_Normal, normals, 3, gl.FLOAT);

shaderProgram.a_texCoord= gl.getAttribLocation(shaderProgram, "a_texCoord");
attributeBuffer(shaderProgram.a_texCoord, texCs, 2, gl.FLOAT);








// gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clearColor(0.1, 0.4, 0.6, 1.0);
gl.enable(gl.DEPTH_TEST);
// gl.enable(gl.POLYGON_OFFSET_FILL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

let model = new Matrix4();
// model.rotate(-45, 1, 0, 0);
// model.rotate(-45, 0, 0, 1);

let view = new Matrix4();
// view.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
view.setLookAt(4, 3, 2, 0, 1, 0, 0, 1, 0);


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

// Spot light
let lposLoc = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
gl.uniform3f(lposLoc, 0.0, 3.0, 4.0);

let ambLoc = gl.getUniformLocation(shaderProgram, "u_ambientLight");
gl.uniform3f(ambLoc, 0.1, 0.1, 0.1);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

// Buffer Pool
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let basePlane = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// NOTE: Bug was a Typo!!! gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
basePlane.texture = textureBuffer;

// _=Create NOTE Renderbuffer NOTE to store depth data
let depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, basePlane);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let effectChannel1 = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer1 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// NOTE: Bug was a Typo!!! gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
effectChannel1.texture = textureBuffer1;

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, effectChannel1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer1, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let effectChannel2 = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer2 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer2);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// NOTE: Bug was a Typo!!! gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
effectChannel2.texture = textureBuffer2;

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, effectChannel2);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer2, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let effectChannel3 = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer3 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer3);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// NOTE: Bug was a Typo!!! gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
effectChannel3.texture = textureBuffer3;

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, effectChannel3);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer3, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let effectChannel4 = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer4 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer4);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// NOTE: Bug was a Typo!!! gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
effectChannel4.texture = textureBuffer4;

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, effectChannel4);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer4, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

// NOTE: Shader channel 1, render plane             CHANNEL1

let shader1 = gl.createProgram();
gl.attachShader(shader1, getShader('Shader-ch1-vs', gl));
gl.attachShader(shader1, getShader('Shader-ch1-fs', gl));
gl.linkProgram(shader1);
shader1.a_Position = gl.getAttribLocation(shader1, "a_Position");
shader1.a_texCoord = gl.getAttribLocation(shader1, "a_texCoord");
shader1.u_sampler = gl.getUniformLocation(shader1, "u_sampler");


// gl.useProgram(shader1);


// Main Textrue
let imageTexture = gl.createTexture(); // Create Textrue
let textureLoc = gl.getUniformLocation(shaderProgram, 'u_sampler');
// Get location

let image = new Image();
image.src = './test2.png';

image.onload = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, basePlane);      // Render to base framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    // NOTE: Render to Framebuffer
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Sending data
    gl.uniform1i(textureLoc, 0);

    gl.activeTexture(gl.TEXTURE1);
// Vertex remap index
    let vmapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render
    // move();
// return;
            // Effect - bloom
    bloom();


};

let last_time = Date.now();
let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    model.rotate(-60/1000*d, 0, 1, 0);
    model.rotate(-60/1000*d, 1, 0, 0);
    // matrix.translate(0, 0, -1/1000*d);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    gl.useProgram(shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, basePlane);
    gl.activeTexture(gl.TEXTURE1);
    attributeBuffer(shaderProgram.a_Position, vertices, 3, gl.FLOAT);

    attributeBuffer(shaderProgram.a_Normal, normals, 3, gl.FLOAT);

    attributeBuffer(shaderProgram.a_texCoord, texCs, 2, gl.FLOAT);

    var vmapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
    // Configure
    // Sending data
    gl.uniform1i(textureLoc, 1);

    gl.activeTexture(gl.TEXTURE1);
// Vertex remap index


    gl.uniformMatrix4fv(modelLocation, false, model.elements);
    nm.setInverseOf(model);
    nm.transpose();
    gl.uniformMatrix4fv(nmLoc, false, nm.elements);

    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

    console.log('FPS:'+Math.floor(1000/d));

    bloom();

    requestAnimationFrame(move);
}
// move();
function drawOrigin() {

}
function bloom() {
    // NOTE: Toggle target buffer                       NOTE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(shader1);
        // Active TXTURE Channel 0 -- which is a texture of last rendering
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    // gl.bindTexture(gl.TEXTURE_2D, basePlane.texture);
    gl.uniform1i(shader1.u_sampler, 0);
    attributeBuffer(shader1.a_Position, new Float32Array([  // Vertex Postion
        -1, 1, 0.0,
        1, 1, 0.0,
        1, -1, 0.0,
        -1, -1, 0.0
    ]), 3, gl.FLOAT);
    attributeBuffer(shader1.a_texCoord, new Float32Array([  // TexCoord
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]), 2, gl.FLOAT);
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]), gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // Render
    return;
    // NOTE: Toggle buffer, Disable Framebuffer, Render to canvas NOTE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(shader1);
        // Active TXTURE Channel 0 -- which is a texture of last rendering
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, effectChannel1.texture);
    gl.uniform1i(shader1.u_sampler, 3);
    attributeBuffer(shader1.a_Position, new Float32Array([  // Vertex Postion
        -1, 1, 0.0,
        1, 1, 0.0,
        1, -1, 0.0,
        -1, -1, 0.0
    ]), 3, gl.FLOAT);
    attributeBuffer(shader1.a_texCoord, new Float32Array([  // TexCoord
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]), 2, gl.FLOAT);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]), gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // Render
}

function GenerateModel(height, radius, sagment) {
    this.r = (c) => Math.PI*c/180.0
    this.cos = (c) => Math.cos(this.r(c));
    this.sin = (c) => Math.sin(this.r(c));
// Vertex
    let del = 360/sagment;
    let vet = [];
    let index = [];
    let nor = [];
    let col = [];
    let tex = [];
    let n, a, b, c;

    // top
    for(let i = 0; i < sagment; i++) {
        a = [radius*this.cos(del*i), 0.0, radius*this.sin(del*i)];
        b = [0, 0, 0];
        c = [radius*this.cos(del*(i+1)), 0.0, radius*this.sin(del*(i+1))];
        vet.push(a[0], a[1], a[2]);
        vet.push(b[0], b[1], b[2]);
        vet.push(c[0], c[1], c[2]);
        n = cross(substractVectors(b, a), substractVectors(c, a));
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);

        tex.push(a[0]/height-0.5, a[2]/height-0.5);
        tex.push(b[0]/height-0.5, b[2]/height-0.5);
        tex.push(c[0]/height-0.5, c[2]/height-0.5);

    }
    // middle
    for(let i = 0; i < sagment; i++) {
        a = [radius*this.cos(del*i), 0.0, radius*this.sin(del*i)];
        b = [radius*this.cos(del*i), height, radius*this.sin(del*i)];
        c = [radius*this.cos(del*(i+1)), height, radius*this.sin(del*(i+1))];
        vet.push(a[0], a[1], a[2]);
        vet.push(b[0], b[1], b[2]);
        vet.push(c[0], c[1], c[2]);
        n = cross(substractVectors(b, a), substractVectors(c, a));
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);

        tex.push(i*0.01, a[1]/height);
        tex.push(i*0.01, b[1]/height);
        tex.push((i+1)*0.01, c[1]/height);


        a = [radius*this.cos(del*(i+1)), height, radius*this.sin(del*(i+1))];
        b = [radius*this.cos(del*(i+1)), 0.0, radius*this.sin(del*(i+1))];
        c = [radius*this.cos(del*i), 0.0, radius*this.sin(del*i)];
        vet.push(a[0], a[1], a[2]);
        vet.push(b[0], b[1], b[2]);
        vet.push(c[0], c[1], c[2]);
        n = cross(substractVectors(b, a), substractVectors(c, a));
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);

        tex.push((i+1)*0.01, a[1]/height);
        tex.push((i+1)*0.01, b[1]/height);
        tex.push(i*0.01, c[1]/height);


        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);


    }
    // bottom
    for(let i = 0; i < sagment; i++) {
        a = [radius*this.cos(del*i), height, radius*this.sin(del*i)];
        b = [0, height, 0];
        c = [radius*this.cos(del*(i+1)), height, radius*this.sin(del*(i+1))];
        vet.push(a[0], a[1], a[2]);
        vet.push(b[0], b[1], b[2]);
        vet.push(c[0], c[1], c[2]);

        let n = cross(substractVectors(b, a), substractVectors(c, a));
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);
        nor.push(n[0], n[1], n[2]);

        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);
        col.push(1.0, 1.0, 1.0);

        tex.push(a[0]/height-0.5, a[2]/height-0.5);
        tex.push(b[0]/height-0.5, b[2]/height-0.5);
        tex.push(c[0]/height-0.5, c[2]/height-0.5);
    }
    for(let i = 0; i < vet.length/3; i++)
        index.push(i);

    return {
        vertices: new Float32Array(vet),
        map: new Uint16Array(index),
        color: new Float32Array(col),
        texCoords: new Float32Array(tex),
        normals: new Float32Array(nor)
    };
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],  // X = a.y * b.z - a.z * b.y
        a[2] * b[0] - a[0] * b[2],  // Y = a.z * b.x - a.x * b.z
        a[0] * b[1] - a[1] * b[0]   // Z = a.x * b.y - a.y * b.x
    ];
}
function substractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
