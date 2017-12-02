
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

// let coloc = gl.getAttribLocation(shaderProgram, "a_Color");

let mod = GenerateModel(1.8, 0.8, 200);
let vertices = mod.vertices;
let normals = mod.normals;
let colors = mod.color;
let texCs = mod.texCoords;

shaderProgram.a_Position= gl.getAttribLocation(shaderProgram, "a_Position");
var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_Position);

var vBuffer = gl.createBuffer();
shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, "a_Normal");
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_Normal);

shaderProgram.a_texCoord= gl.getAttribLocation(shaderProgram, "a_texCoord");
var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, texCs, gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_texCoord, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_texCoord);

// Vertex remap index
let vmapBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);

let vmapData = mod.map;





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

// Spot light
let lposLoc = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
gl.uniform3f(lposLoc, 0.0, 3.0, 4.0);

let ambLoc = gl.getUniformLocation(shaderProgram, "u_ambientLight");
gl.uniform3f(ambLoc, 0.2, 0.2, 0.2);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vmapData, gl.STATIC_DRAW);

// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Create Framebuffer NOTE
let fb = gl.createFramebuffer();

// Create NOTE Texturebuffer NOTE to store color data
let textureBuffer = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LIEARN);
fb.texture = textureBuffer;

// _=Create NOTE Renderbuffer NOTE to store depth data
let depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);

// NOTE: Attach those
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureBuffer, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// _=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

// Textrue
let texture = gl.createTexture(); // Create Textrue
let textureLoc = gl.getUniformLocation(shaderProgram, 'u_sampler');
// Get location

let image = new Image();
image.src = './hello.png';
image.onload = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // Sending data
    gl.uniform1i(textureLoc, 1);
    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render
    // move();
    // NOTE: Toggle buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fb.texture);
    gl.uniform1i(textureLoc, 0);

    // gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render


};

let last_time = Date.now();
let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    model.rotate(-60/1000*d, 0, 1, 0);
    model.rotate(-60/1000*d, 1, 0, 0);
    // matrix.translate(0, 0, -1/1000*d);
    gl.uniformMatrix4fv(modelLocation, false, model.elements);
    // gl.uniformMatrix4fv(viewLocation, false, view.elements);
    // gl.uniformMatrix4fv(projeLocation, false, proje.elements);
    nm.setInverseOf(model);
    nm.transpose();
    gl.uniformMatrix4fv(nmLoc, false, nm.elements);

    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

    // console.log('FPS:'+Math.floor(1000/d));


    requestAnimationFrame(move);
}
// move();


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

        tex.push(a[0]/height, a[1]/height);
        tex.push(b[0]/height, b[1]/height);
        tex.push(c[0]/height, c[1]/height);


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

        tex.push(a[0]/height, a[1]/height);
        tex.push(b[0]/height, b[1]/height);
        tex.push(c[0]/height, c[1]/height);


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
