
const DEBUG = false;

/**
 * 1 dimensional line segment overlap function
 */
function overlap(a, b, c, d) {
    // Ensure a < b
    if (a > b) {
        let t = a;
        a = b;
        b = t;
    }
    // Ensure c < d
    if (c > d) {
        let t = c;
        c = d;
        d = t;
    }
    const oStart = Math.max(a, c);
    const oEnd = Math.min(b, d);
    return [oStart, oEnd];
}

class Rectangle {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static fromPoints(xMin, yMin, xMax, yMax) {
        const width = xMax - xMin;
        const height = yMax - yMin;
        if (width <= 0 || height <= 0) {
            throw new Error('width must be greater than 0');
        }
        if (height <= 0) {
            throw new Error('height must be greater than 0');
        }
        return new Rectangle(xMin, yMax, width, height);
    }

    static fromPositionVectors(vec1, vec2) {
        return Rectangle.fromPoints(
            Math.min(vec1.x, vex2.x),
            Math.min(vec1.y, vex2.y),
            Math.max(vec1.x, vex2.x),
            Math.max(vec1.y, vex2.y)
        );
    }

    get max() {
        return this.location.add(new Vector(this.width, this.height));
    }

    get min() {
        return this.location;
    }

    get location() {
        return new Vector(this.x, this.y);
    }

    get origin() {
        return new Vector(this.x + this.width / 2, this.y + this.height / 2);
    }

    translate(v) {
        return new Rectangle(this.x + v.x, this.y + v.y, this.width, this.height);
    }

    toPath() {
        const path = new Path2D();
        path.rect(this.x, this.y, this.width, this.height);
        return path;
    }

    intersect(other) {
        if (this.min.x < this.max.x < other.min.x < other.max.x) {
            return null;
        }
        return new Rectangle();
    }
}

class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromPoints(x1, y1, x2, y2) {
        return new Vector(x2 - x1, y2 - y1);
    }

    static fromVectors(v1, v2) {
        return new Vector(v2.x - v1.x, v2.y - v2.x);
    }

    get length() {
        return Math.sqrt(Math.pow(Math.abs(this.x), 2) + Math.pow(Math.abs(this.y), 2));
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    diff(v) {
        return new Vector(v.x - this.x, v.y - this.y);
    }

    normalize() {
        const l = this.length;
        if (l === 0) {
            return new Vector(0, 0);
        }
        return new Vector(this.x / l, this.y / l);
    }

    scale(c) {
        return new Vector(this.x * c, this.y * c);
    }

    inverse() {
        return new Vector(-this.x, -this.y);
    }

    swap() {
        return new Vector(this.y, this.x);
    }

    rotate(radians) {
        return new Vector(this.x * Math.cos(radians) - this.y * Math.sin(radians),
            this.x * Math.sin(radians) + this.y * Math.cos(radians));
    }

    toPath(origin) {
        const path = new Path2D();
        path.moveTo(origin.x, origin.y);
        path.lineTo(origin.x + this.x, origin.y + this.y);
        // get small 45 degree counter clockwise line
        const markerRight = this.inverse().normalize().scale(10).rotate(-Math.PI / 6);
        path.lineTo(origin.x + this.x + markerRight.x, origin.y + this.y + markerRight.y);
        return path;
    }
}

class Bezier {
    constructor({
        src = new Vector(0, 0),
        dest = new Vector(0, 0),
        srcHandle = new Vector(0, 0),
        destHandle = new Vector(0, 0)
    } = {}) {
        this.src = src;
        this.dest = dest;
        this.srcHandle = srcHandle;
        this.destHandle = destHandle;
    }

    get absSrcHandle() {
        return this.src.add(this.srcHandle);
    }

    get absDestHandle() {
        return this.dest.add(this.destHandle);
    }

    path() {
        const path = new Path2D();
        path.moveTo(this.src.x, this.src.y);
        path.bezierCurveTo(this.absSrcHandle.x, this.absSrcHandle.y, this.absDestHandle.x, this.absDestHandle.y, this.dest.x, this.dest.y);
        return path;
    }

    draw(ctx, debug = false) {
        ctx.save();

        const path = this.path();
        ctx.stroke(path);

        if (DEBUG || debug) {
            line(ctx, this.src, this.absSrcHandle, { color: 'cyan' });
            line(ctx, this.dest, this.absDestHandle, { color: 'yellow' });

            dot(ctx, this.absSrcHandle, { color: 'cyan' });
            dot(ctx, this.absDestHandle, { color: 'yellow' });

            dot(ctx, this.src);
            dot(ctx, this.dest);
        }

        ctx.restore();
        return ctx.pat
    }
}
