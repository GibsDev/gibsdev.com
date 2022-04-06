const canvas = document.getElementById('first');

const WIDTH = 500;
const HEIGHT = 500;

canvas.width = WIDTH;
canvas.height = HEIGHT;

let ctx = canvas.getContext('2d');

ctx.save();

for (let i = 0; i < 100; i++) {
    const dot = new Path2D();
    
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;

    dot.moveTo(x, y);
    dot.arc(x, y, 3, 0, 2 * Math.PI, true);
    dot.closePath();
    
    ctx.fillStyle = 'white';
    
    ctx.fill(dot);
}

ctx.restore();
