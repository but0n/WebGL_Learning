function Matrix4() {
    this.buff = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    this.elements = new Float32Array(this.buff);

// Prototype - Generate matrix
    this.translateMatrix = (x, y, z) => {
        if(x!=null && y!=null && z!=null) {
            return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1
            ];
        }
    };

    this.rotateXMatrix = (angle) => [
        1, 0, 0, 0,
        0, this.cos(angle), this.sin(angle), 0,
        0, -this.sin(angle), this.cos(angle), 0,
        0, 0, 0, 1
    ];
    this.rotateYMatrix = (angle) => [
        this.cos(angle), 0, this.sin(angle), 0,
        0, 1, 0, 0,
        -this.sin(angle), 0, this.cos(angle), 0,
        0, 0, 0, 1
    ];
    this.rotateZMatrix = (angle) => [
        this.cos(angle), this.sin(angle), 0, 0,
        -this.sin(angle), this.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    this.scaleMatrix = (x, y, z) => [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ];


// Override Matrix
    this.setTranslate = (x, y, z) => {
        this.elements.set(this.translateMatrix(x, y, z));
    }

    this.r = (c) => Math.PI*c/180.0
    this.cos = (c) => Math.cos(this.r(c));
    this.sin = (c) => Math.sin(this.r(c));

    this.setRotate = (angle, x, y, z) => {
        if(x) {
            this.elements.set(this.rotateXMatrix(angle));
        } else if(y) {
            this.elements.set(this.rotateYMatrix(angle));
        } else if(z) {
            this.elements.set(this.rotateZMatrix(angle));
        }
    }

    this.setScale = (x, y, z) => {
        this.elements.set(this.scaleMatrix(x, y, z));
    }
// Row to column convert map
    this.trans = [
        0, 4, 8, 12,
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15
    ];
// Calculator
    this._muilt = (a, b, pos) => {
        const c = this.trans; // Row to column convert map reference
        let raw = c[Math.floor(pos/4)];     // Row offset
        let col = c[Math.floor(c[pos]/4)];  // Column offset
        let result = 0;
        for(let i = 0; i < 4; i++) {
            result += a[raw++] * b[c[col++]];
        }
        return result;
    }
    this.MatrixMuilt = (a, b) => {
        let arr = [];
        for(let i = 0; i < 16; i++) {
            arr.push(this._muilt(a, b, i));
        }
        arr = new Float32Array(arr);
        return arr;
    }
    this.multiply = (a) => {
        if(a.constructor.name === "Matrix4") {
            a = a.elements;
        }
        this.elements = this.MatrixMuilt(a, this.elements);
    }

// Multi-F
    this.translate = (x, y, z) => {
        this.multiply(this.translateMatrix(x, y, z));
    }

    this.rotate = (angle, x, y, z) => {
        if((x|y|z) && angle!=0) { // if current opreation is valid
            let tmp;
            if(x) {
                tmp = this.rotateXMatrix(angle);
            } else if(y) {
                tmp = this.rotateYMatrix(angle);
            } else if(z) {
                tmp = this.rotateZMatrix(angle);
            }
            this.multiply(tmp);
        }
    }
    this.scale = (x, y, z) => {
        this.multiply(this.scaleMatrix(x, y, z));
    }

    this.set = (m) => {
        if(m.constructor.name === "Matrix4")
            this.elements = m.elements;
    }

// View matrix - Override this.elements
    this.setLookAt = (eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) => {
        let zAxis = normalize(substractVectors(
            [eyeX, eyeY, eyeZ],
            [atX, atY, atZ])
        );
        let xAxis = cross([upX, upY, upZ], zAxis);
        let yAxis = cross(zAxis, xAxis);

        this.elements = new Float32Array([
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            -eyeX    , -eyeY    , -eyeZ    , 1
        ]);
    }

// Projection matrix - Override this.elements
    this.setOrtho = (left, right, bottom, top, near, far) => {
        this.elements = new Float32Array([
            2 / (right-left), 0, 0, 0,
            0, 2 / (top-bottom), 0, 0,
            0, 0, -2 / (far-near), 0,
            (right+left) / (left-right), (top+bottom) / (bottom-top), (far+near) / (near-far), 1
        ]);
    }
    this.setPerspective = (fov, aspect, near, far) => {
        this.elements = new Float32Array([
            1 / (aspect * Math.tan(fov/2)), 0, 0, 0,
            0, 1 / Math.tan(fov/2), 0, 0,
            0, 0, (far+near) / (near-far), -1,
            0, 0, 2*far*near / (near-far), 0
        ]);
    }

}


// Vector functions
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

function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // Make sure length > 0
    if(length > 0) {
        return [v[0]/length, v[1]/length, v[2]/length];
    } else {
        return [0,0,0];
    }
}