function Matrix4() {
    this.buff = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    this.elements = new Float32Array(this.buff);

    // Override Matrix
    this.setTranslate = (x, y, z) => {
        this.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    this.rotateItemMap = [0, 1, 4, 5];
    this.r = (c) => Math.PI*c/180.0
    this.cos = (c) => Math.cos(r(c));
    this.sin = (c) => Math.sin(r(c));

    // Override Matrix
    this.setRotate = (angle, x, y, z) => {
        if(x) {
            this.elements.set([
                1, 0, 0, 0,
                0, cos(angle), sin(angle), 0,
                0, -sin(angle), cos(angle), 0,
                0, 0, 0, 1
            ]);
        } else if(y) {
            this.elements.set([
                cos(angle), 0, sin(angle), 0,
                0, 1, 0, 0,
                -sin(angle), 0, cos(angle), 0,
                0, 0, 0, 1
            ]);
        } else if(z) {
            this.elements.set([
                cos(angle), sin(angle), 0, 0,
                -sin(angle), cos(angle), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
    }

    // Override Matrix
    this.setScale = (x, y, z) => {
        this.elements.set([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }
    // Row to column convert map
    this.trans = [
        0, 4, 8, 12,
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15
    ];
    this._muilt = (a, b, pos) => {
        let c = this.trans; // Row to column convert map reference
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
        let result = new Float32Array(arr);
        return arr;
    }

}