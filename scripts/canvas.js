
let gl = document.getElementsByClassName('ctx').item(0).getContext('webgl');

// let rad = 1;
// let sigma = rad*3.3;
// let sigma2 = 2.0 * sigma * sigma;
// let sigmap = sigma2 * Math.PI;
// let wsum = 0;
// let result = [];
// for(let i = -rad; i <= rad; i++) {
//     for(let j = -rad; j <= rad; j++) {
//         let w = Math.exp(-(i*i + j*j) / sigma2) / sigmap;
//         wsum += w;
//     }
// }
// console.log('sum:\t' + wsum);
// for(let i = -rad; i <= rad; i++) {
//     for(let j = -rad; j <= rad; j++) {
//         let w = Math.exp(-(i*i + j*j) / sigma2) / sigmap / wsum;
//         if(j>=0 && i>=0) {
//             console.log('('+j+','+i+')\t' + w);
//             result.push(w);}
//     }
//     console.log('\n');
// }
// console.log(result);


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

// let mod = GenerateModel(1.8, 0.8, 500);
let mod = GenerateSphere(2.4, 40);
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

shaderProgram.u_Camera = gl.getUniformLocation(shaderProgram, "u_Camera");

shaderProgram.u_sky = gl.getUniformLocation(shaderProgram, "u_sky");








// gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clearColor(0.2, 0.2, 0.2, 1.0);
gl.enable(gl.DEPTH_TEST);
// gl.enable(gl.POLYGON_OFFSET_FILL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

let model = new Matrix4();
model.rotate(180, 0, 1, 0);
// model.rotate(-45, 1, 0, 0);
// model.rotate(-45, 0, 0, 1);

let view = new Matrix4();
// view.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
view.setLookAt(0, 0, 10, 0, 0, 0, 0, 1, 0);
gl.uniform3fv(shaderProgram.u_Camera, new Vector3([0, 0, 10]).elements);

let proje = new Matrix4();
proje.setPerspective(30, 1, 1, 100);

let modelLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
let viewLocation = gl.getUniformLocation(shaderProgram, 'u_ViewMatrix');
let projeLocation = gl.getUniformLocation(shaderProgram, 'u_ProjeMatrix');
gl.uniformMatrix4fv(modelLocation, false, model.elements);
gl.uniformMatrix4fv(viewLocation, false, view.elements);
gl.uniformMatrix4fv(projeLocation, false, proje.elements);
// Light uniform
// let lightColorLoc = gl.getUniformLocation(shaderProgram, "u_lightColor");
// gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0);
let lightDirectionLoc = gl.getUniformLocation(shaderProgram, "u_lightDirection");
let ld = new Vector3([-9.5, 3.0, -30.0]);
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
gl.uniform3f(lposLoc, -30.0, 0.0, 0.0);

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

shader1.u_ModelMatrix = gl.getUniformLocation(shader1, "u_ModelMatrix");
shader1.u_ViewMatrix = gl.getUniformLocation(shader1, "u_ViewMatrix");
shader1.u_ProjeMatrix = gl.getUniformLocation(shader1, "u_ProjeMatrix");






// Main Textrue
let imageTexture = gl.createTexture(); // Create Textrue
shaderProgram.textureLoc = gl.getUniformLocation(shaderProgram, 'u_sampler');

//                                  PBR Material
//=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
let MESH_PATH = "/mesh4/"
shaderProgram.uvNormal = gl.getUniformLocation(shaderProgram, 'uv_Normal');
let meshNormalTexture = gl.createTexture();
let meshNormal = new Image();
meshNormal.src = './meshes'+MESH_PATH+'normal.png';
meshNormal.onload = () => {
    gl.useProgram(shaderProgram);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, meshNormalTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, meshNormal);
    // Sending data
    gl.uniform1i(shaderProgram.uvNormal, 2);
}
//=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
shaderProgram.uvBasecolor = gl.getUniformLocation(shaderProgram, 'uv_Basecolor');
let meshBasecolorTexture = gl.createTexture();
let meshBasecolor = new Image();
meshBasecolor.src = './meshes'+MESH_PATH+'basecolor.png';
meshBasecolor.onload = () => {
    gl.useProgram(shaderProgram);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, meshBasecolorTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, meshBasecolor);
    // Sending data
    gl.uniform1i(shaderProgram.uvBasecolor, 4);
}
//=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
shaderProgram.uvMetallic = gl.getUniformLocation(shaderProgram, 'uv_Metallic');
let meshMetallicTexture = gl.createTexture();
let meshMetallic = new Image();
meshMetallic.src = './meshes'+MESH_PATH+'metallic.png';
meshMetallic.onload = () => {
    gl.useProgram(shaderProgram);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, meshMetallicTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, meshMetallic);
    // Sending data
    gl.uniform1i(shaderProgram.uvMetallic, 5);
}
//=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
shaderProgram.uvRoughness = gl.getUniformLocation(shaderProgram, 'uv_Roughness');
let meshRoughnessTexture = gl.createTexture();
let meshRoughness = new Image();
meshRoughness.src = './meshes'+MESH_PATH+'roughness.png';
meshRoughness.onload = () => {
    gl.useProgram(shaderProgram);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, meshRoughnessTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, meshRoughness);
    // Sending data
    gl.uniform1i(shaderProgram.uvRoughness, 6);
}
//=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_

// shaderProgram.uvNormal = gl.getUniformLocation(shaderProgram, 'uv_Normal');


let skybox = gl.createTexture();
// let mapPath = './blurmap/';
// let mapPath = './map/';
// let mapPath = './dockmap/';
let mapPath = './housemap/';

let cube0 = new Image();
let cube0Texture = gl.createTexture();
cube0.src = mapPath + 'negx.jpg';
cube0.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, cube0Texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube0);
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
}
let cube1 = new Image();
let cube1Texture = gl.createTexture();
cube1.src = mapPath + 'negy.jpg';
cube1.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube1);
}
let cube2 = new Image();
let cube2Texture = gl.createTexture();
cube2.src = mapPath + 'negz.jpg';
cube2.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube2);
}
let cube3 = new Image();
let cube3Texture = gl.createTexture();
cube3.src = mapPath + 'posx.jpg';
cube3.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube3);
}
let cube4 = new Image();
let cube4Texture = gl.createTexture();
cube4.src = mapPath + 'posy.jpg';
cube4.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube4);
}
let cube5 = new Image();
let cube5Texture = gl.createTexture();
cube5.src = mapPath + 'posz.jpg';
cube5.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cube5);
    loadCubeMap(gl);
}



let image = new Image();
image.src = './brdf.png';
image.onload = () => {
    gl.useProgram(shaderProgram);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);      // Render to base framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    // NOTE: Render to Framebuffer
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    // Configure
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Sending data
    gl.uniform1i(shaderProgram.textureLoc, 0);

    // gl.activeTexture(gl.TEXTURE1);
// Vertex remap index
    let vmapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render


    // gl.useProgram(shader1);
    //
    // gl.uniformMatrix4fv(shader1.u_ModelMatrix, false, model.elements);
    // gl.uniformMatrix4fv(shader1.u_ViewMatrix, false, view.elements);
    // gl.uniformMatrix4fv(shader1.u_ProjeMatrix, false, proje.elements);
    // drawSkyBox();
    // gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render
    // move();
// return;
            // Effect - bloom
    // bloom();
};
let gView = {};
gView.x = 0;
gView.y = 0;
gView.status = 0;
let last_time = Date.now();
let drag = (e) => {
    gView.x = e.clientX;
    gView.y = e.clientY;
    gView.status = 1;
}
let stopDrag = (e) => {
    gView.status = 0;
}
let mousemove = (e) => {
    if(gView.status == 1) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

        let delX = e.clientX - gView.x;
        let delY = e.clientY - gView.y;
        model.rotate(delX, 0, 1, 0);
        model.rotate(-delY, 1, 0, 0);
        // model.rotate(20/1000*d, 0, 1, 0);

        // matrix.translate(0, 0, -1/1000*d);


        gl.useProgram(shaderProgram);
        attributeBuffer(shaderProgram.a_Position, vertices, 3, gl.FLOAT);

        attributeBuffer(shaderProgram.a_Normal, normals, 3, gl.FLOAT);


        var vmapBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
        // Configure
        // Sending data

    // Vertex remap index


        gl.uniformMatrix4fv(modelLocation, false, model.elements);
        nm.setInverseOf(model);
        nm.transpose();
        gl.uniformMatrix4fv(nmLoc, false, nm.elements);
        gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

        drawSkyBox();


        gView.x = e.clientX;
        gView.y = e.clientY;
    }

}

let drawSkyBox = () => {
    let subMatrix = new Matrix4();
    subMatrix.setTranslate(0, 0, 0);
    subMatrix.multiply(model);

    gl.useProgram(shader1);
    gl.uniformMatrix4fv(shader1.u_ModelMatrix, false, subMatrix.elements);

    gl.uniform1i(shader1.u_sampler, 1);
    attributeBuffer(shader1.a_Position, new Float32Array([  // Vertex Postion
        -20, 20, 0.0,
        20, 20, 0.0,
        20, -20, 0.0,
        -20, -20, 0.0
    ]), 3, gl.FLOAT);
    attributeBuffer(shader1.a_texCoord, new Float32Array([  // TexCoord
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]), 2, gl.FLOAT);
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]), gl.STATIC_DRAW);

    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // Render

}

let move = () => {
    let d = Date.now() - last_time;
    last_time = Date.now();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    // model.rotate(80/1000*d, 0, 1, 0);
    // model.rotate(30/1000*d, 1, 0, 0);
    model.rotate(20/1000*d, 0, 1, 0);

    // matrix.translate(0, 0, -1/1000*d);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    gl.useProgram(shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE1);
    attributeBuffer(shaderProgram.a_Position, vertices, 3, gl.FLOAT);

    attributeBuffer(shaderProgram.a_Normal, normals, 3, gl.FLOAT);

    // attributeBuffer(shaderProgram.a_texCoord, texCs, 2, gl.FLOAT);

    var vmapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
    // Configure
    // Sending data
    gl.uniform1i(shaderProgram.textureLoc, 1);

    gl.activeTexture(gl.TEXTURE1);
// Vertex remap index


    gl.uniformMatrix4fv(modelLocation, false, model.elements);
    nm.setInverseOf(model);
    nm.transpose();
    gl.uniformMatrix4fv(nmLoc, false, nm.elements);
    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

    // gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

    // console.log('FPS:'+Math.floor(1000/d));

    // bloom();

    // requestAnimationFrame(move);
}
// move();
function loadCubeMap(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    // Configure
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.uniform1i(shaderProgram.u_sky, 3);

    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // // Sending data
    // gl.uniform1i(shaderProgram.textureLoc, 0);
}
function bloom() {
    // NOTE: Toggle target buffer                       NOTE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(shader1);
        // Active TXTURE Channel 0 -- which is a texture of last rendering
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, basePlane.texture);
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

function GenerateSphere(radius, sagment) {
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
    let n, a, b, c, d;

    for(let w = 0; w < 360; w+=del) {
        for(let t = 0; t < 90; t+=del) {
            a = [radius * this.sin(t) * this.cos(w), radius * this.cos(t), radius * this.sin(t) * this.sin(w)];
            b = [radius * this.sin(t+del) * this.cos(w), radius * this.cos(t+del), radius * this.sin(t+del) * this.sin(w)];
            c = [radius * this.sin(t+del) * this.cos(w+del), radius * this.cos(t+del), radius * this.sin(t+del) * this.sin(w+del)];
            vet.push(a[0], a[1], a[2]);
            vet.push(b[0], b[1], b[2]);
            vet.push(c[0], c[1], c[2]);
            let n = substractVectors(a, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            n = substractVectors(b, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            n = substractVectors(c, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            //  UV
            tex.push(t/180, w/360);             // a
            tex.push((t+del)/180, w/360);       // b
            tex.push((t+del)/180, (w+del)/360); // c
            if((t!=0) && t!=(90)) { // top or bottom spot
                d = [radius * this.sin(t) * this.cos(w + del), radius * this.cos(t), radius * this.sin(t) * this.sin(w + del)];
                vet.push(a[0], a[1], a[2]);
                vet.push(c[0], c[1], c[2]);
                vet.push(d[0], d[1], d[2]);

                let n = substractVectors(a, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(c, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(d, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);

                //  UV
                tex.push(t/180, w/360);             // a
                tex.push((t+del)/180, (w+del)/360); // c
                tex.push(t/180, (w+del)/360);       // d

            }

            for(let t = 180; t > 90; t-=del) {
                a = [radius * this.sin(t) * this.cos(w), radius * this.cos(t), radius * this.sin(t) * this.sin(w)];
                b = [radius * this.sin(t-del) * this.cos(w), radius * this.cos(t-del), radius * this.sin(t-del) * this.sin(w)];
                c = [radius * this.sin(t-del) * this.cos(w+del), radius * this.cos(t-del), radius * this.sin(t-del) * this.sin(w+del)];
                vet.push(a[0], a[1], a[2]);
                vet.push(b[0], b[1], b[2]);
                vet.push(c[0], c[1], c[2]);
                let n = substractVectors(a, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(b, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(c, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                //  UV
                tex.push(t/180, w/360);             // a
                tex.push((t-del)/180, w/360);       // b
                tex.push((t-del)/180, (w+del)/360); // c
                if((t!=0) && t!=(90-del)) { // top or bottom spot
                    d = [radius * this.sin(t) * this.cos(w + del), radius * this.cos(t), radius * this.sin(t) * this.sin(w + del)];
                    vet.push(a[0], a[1], a[2]);
                    vet.push(c[0], c[1], c[2]);
                    vet.push(d[0], d[1], d[2]);

                    let n = substractVectors(a, [0, 0, 0]);
                    nor.push(n[0], n[1], n[2]);
                    n = substractVectors(c, [0, 0, 0]);
                    nor.push(n[0], n[1], n[2]);
                    n = substractVectors(d, [0, 0, 0]);
                    nor.push(n[0], n[1], n[2]);

                    //  UV
                    tex.push(t/180, w/360);             // a
                    tex.push((t-del)/180, (w+del)/360); // c
                    tex.push(t/180, (w+del)/360);       // d

                }
            }

        }
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
