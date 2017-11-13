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

// Multi-F
    this.translate = (x, y, z) => {
        let tmp = this.translateMatrix(x, y, z);
        this.elements = this.MatrixMuilt(this.elements, tmp);
    }

    this.rotate = (angle, x, y, z) => {
        if((x|y|z) && angle!=0) { // if current opreation is valid
            if(x) {
                let tmp = this.rotateXMatrix(angle);
            } else if(y) {
                let tmp = this.rotateYMatrix(angle);
            } else if(z) {
                let tmp = this.rotateZMatrix(angle);
            }
            this.elements = this.MatrixMuilt(this.elements, tmp);
        }
    }
    this.scale = (x, y, z) => {
        let tmp = this.scaleMatrix(x, y, z);
        this.elements = this.MatrixMuilt(this.elements, tmp);
    }

    this.set = (m) => {
        if(m.constructor.name === "Matrix4")
            this.elements = m.elements;
    }

}