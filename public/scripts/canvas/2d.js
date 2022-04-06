
const DEBUG = false;

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
