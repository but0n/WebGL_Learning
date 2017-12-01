
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
// @GENERATE

let sun = GenerateModel(1.2, 0.8, 20, 0);
let earth = GenerateModel(0.8, 0.4, 20, sun.length);
earth.offset = sun.length *2;
let moon = GenerateModel(0.4, 0.2, 20, sun.length + earth.length);
moon.offset = (sun.length + earth.length) *2;

// earth.offset = sun.length;
// moon.offset = sun.length+earth.length;


// NOTE: Attributes
shaderProgram.a_Position= gl.getAttribLocation(shaderProgram, "a_Position");
var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sun.vertices.concat(earth.vertices).concat(moon.vertices)), gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_Position);

var vBuffer = gl.createBuffer();
shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, "a_Normal");
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sun.normals.concat(earth.normals).concat(moon.normals)), gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_Normal);

shaderProgram.a_texCoord= gl.getAttribLocation(shaderProgram, "a_texCoord");
var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   // NOTE:
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sun.texCoords.concat(earth.texCoords).concat(moon.texCoords)), gl.STATIC_DRAW);
gl.vertexAttribPointer(shaderProgram.a_texCoord, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(shaderProgram.a_texCoord);

// Vertex remap index
let vmapBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);






gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
// gl.enable(gl.POLYGON_OFFSET_FILL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

// NOTE: Matrix                                     NOTE

let model = new Matrix4();
// model.translate(1, 0, 0);
// model.rotate(-45, 0, 1, 0);

// model.rotate(-45, 0, 0, 1);

let view = new Matrix4();
// view.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
view.setLookAt(0, 19, 10, 0, 0, 0, 0, 1, 0);


let proje = new Matrix4();
proje.setPerspective(30, 1, 1, 100);

let mvp = new Matrix4();
mvp.set(proje).multiply(view);

shaderProgram.u_ModelMatrix = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
// shaderProgram.u_ViewMatrix = gl.getUniformLocation(shaderProgram, 'u_ViewMatrix');
// shaderProgram.u_ProjeMatrix = gl.getUniformLocation(shaderProgram, 'u_ProjeMatrix');
shaderProgram.u_mvpMatrix = gl.getUniformLocation(shaderProgram, 'u_mvpMatrix');
// gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, model.elements);
// gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix, false, view.elements);
// gl.uniformMatrix4fv(shaderProgram.u_ProjeMatrix, false, proje.elements);
gl.uniformMatrix4fv(shaderProgram.u_mvpMatrix, false, mvp.elements);
// Light uniform
shaderProgram.u_lightColor = gl.getUniformLocation(shaderProgram, "u_lightColor");
gl.uniform3f(shaderProgram.u_lightColor, 1.0, 1.0, 1.0);
shaderProgram.u_lightDirection = gl.getUniformLocation(shaderProgram, "u_lightDirection");
let ld = new Vector3([0.5, 3.0, 4.0]);
ld.normalize();
gl.uniform3fv(shaderProgram.u_lightDirection, ld.elements);

// Normal Matrix
let nm = new Matrix4();
shaderProgram.u_normalMatrix = gl.getUniformLocation(shaderProgram, "u_normalMatrix");
nm.setInverseOf(model);
nm.transpose();
gl.uniformMatrix4fv(shaderProgram.u_normalMatrix, false, nm.elements);

// Spot light
shaderProgram.u_lightPosition = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
gl.uniform3f(shaderProgram.u_lightPosition, 0.0, 0.0, 0.0);

shaderProgram.u_ambientLight = gl.getUniformLocation(shaderProgram, "u_ambientLight");
gl.uniform3f(shaderProgram.u_ambientLight, 0.5, 0.5, 0.9);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sun.map.concat(earth.map).concat(moon.map)), gl.STATIC_DRAW);



// Textrue
let texture = gl.createTexture(); // Create Textrue
shaderProgram.u_sampler = gl.getUniformLocation(shaderProgram, 'u_sampler');
// Get location



let image = new Image();
image.src = './hello.png';
image.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // Sending data
    gl.uniform1i(shaderProgram.u_sampler, 0);

    // EarthMatrix.rotate(30, 0, 1, 0);
    EarthMatrix.translate(4.0, 0.0, 0.0);

    MoonMatrix.translate(1.0, 0.0, 0.0);
    // MoonMatrix.scale(0.4, 0.4, 0.4);


    drawSun(SunMatrix);
    drawEarth(EarthMatrix);
    drawMoon(MoonMatrix);
    move();


};

let last_time = Date.now();
let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    // EarthMatrix.rotate(-60/1000*d, 0, 1, 0);

    let tmp = new Matrix4();
    SunMatrix.rotate(-12/1000*d, 0, 1, 0);
    EarthMatrix.rotate(-198/1000*d, 0, 1, 0);

    tmp.set(SunMatrix);
    drawSun(SunMatrix);

    drawEarth(tmp.multiply(EarthMatrix));


    drawMoon(tmp.multiply(MoonMatrix));


    console.log('FPS:'+Math.floor(1000/d));


    requestAnimationFrame(move);
}
// move();
function GenerateModel(height, radius, sagment, offset) {
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
        index.push(i+offset);

    return {
        vertices: vet,
        map: index,
        color: col,
        texCoords: tex,
        normals: nor,
        length: index.length,
        offset: 0
    };
}

let SunMatrix = new Matrix4();
let drawSun = (a) => {
    nm.setInverseOf(a);
    nm.transpose();
    gl.uniformMatrix4fv(shaderProgram.u_normalMatrix, false, nm.elements);
    gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, a.elements);
    gl.drawElements(gl.TRIANGLES, sun.length, gl.UNSIGNED_SHORT, sun.offset); // Render
}
let EarthMatrix = new Matrix4();
let drawEarth = (a) => {
    nm.setInverseOf(a);
    nm.transpose();
    gl.uniformMatrix4fv(shaderProgram.u_normalMatrix, false, nm.elements);
    gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, a.elements);
    gl.drawElements(gl.TRIANGLES, earth.length, gl.UNSIGNED_SHORT, earth.offset); // Render
}
let MoonMatrix = new Matrix4();
let drawMoon = (a) => {
    nm.setInverseOf(a);
    nm.transpose();
    gl.uniformMatrix4fv(shaderProgram.u_normalMatrix, false, nm.elements);
    gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, a.elements);
    gl.drawElements(gl.TRIANGLES, moon.length, gl.UNSIGNED_SHORT, moon.offset); // Render
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
