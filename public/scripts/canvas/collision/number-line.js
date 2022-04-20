(() => {
    const canvas = document.getElementById('numberline');

    const WIDTH = 500;
    const HEIGHT = 120;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = '#111';

    let a = 50, b = 100;
    let c = 150, d = 250;
    let paused = false;
    let frames = 0;

    function render() {
        ctx.save();

        ctx.lineWidth = 0.25;
        ctx.strokeStyle = 'white';
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 20 * i);
            ctx.lineTo(WIDTH, 20 * i);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'white';

        // Line ab
        ctx.fillText('a', a, 15);
        ctx.fillText('b', b, 15);
        ctx.beginPath();
        ctx.moveTo(a, 20);
        ctx.lineTo(b, 20);
        ctx.stroke();
        ctx.closePath();
        
        // Line cb
        ctx.fillText('c', c, 35);
        ctx.fillText('d', d, 35);
        ctx.beginPath();
        ctx.moveTo(c, 40);
        ctx.lineTo(d, 40);
        ctx.stroke();
        ctx.closePath();

        // Line ad
        ctx.strokeStyle = 'cyan';
        const ad = new Vector(d - a, 0);
        ctx.stroke(ad.toPath(new Vector(a, 60)));
        
        // Line cb
        ctx.strokeStyle = 'magenta';
        const cb = new Vector(b - c, 0);
        ctx.stroke(cb.toPath(new Vector(c, 80)));

        // Line o
        const oStart = Math.max(a, c);
        const oEnd = Math.min(b, d);
        const o = new Vector(oEnd - oStart, 0);
        if (o.x < 0) {
            ctx.strokeStyle = 'red';
        } else {
            ctx.strokeStyle = 'lightgreen';
        }
        ctx.stroke(o.toPath(new Vector(oStart, 100)));

        ctx.restore();
    }

    setInterval(() => {
        if (!paused) {
            const ddelta = 0.5 + Math.sin(frames / 25) / 2;
            const delta = 0.5 + Math.sin(frames / 100) / 2;
            a = 50 + (250 * delta);
            b = a + 10 + 150 * ddelta;
            window.requestAnimationFrame(render);
            frames++;
        }
    }, 1000 / 60);

    const button = document.createElement('button');
    button.style.display = 'block';
    button.innerText = 'Pause/Play';
    button.addEventListener('click', () => {
        paused = !paused;
    });
    canvas.parentElement.appendChild(button);
    
})();