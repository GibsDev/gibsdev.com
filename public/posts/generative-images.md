# Generative images using HTML5 canvas and javascript

![Generative image 0](/images/generative-0.png)

From early 2021 to 2022 I was deeply involved crypto, specifically Etherum and defi. I learned a lot about NFTs and how they work and what they could be usseful for. Many of the popular NFT projects use some sort of generative code to combine assets into a large number of unique images, and it got me thinking about how I would go about doing something like that myself.

An old friend of mine from school regularly posts images on their social media of their artwork. The best way to describe them would be a page full of organic shards of varying sizes. I think the appeal for me is the consistent size and repitition of the shards, while still producing a very organic looking image. I had suggested that he try and make them digitally (with scalable vector graphics), but as far as I know he has not tried yet.

This got me thinking about if I could make something similar digitally. So I opened up [Inkscape](https://inkscape.org/) and had a go at it. Unfortunately I'm not much of an artist, and I don't really have the patience for something like this. But I AM willing to spend 20x more time on creating a program that could generate pictures for me!

<hr>

## The basics

The image below is actually being generated each time the page loads. It is generating 100 random points and drawing them on the canvas.

<canvas id="first"></canvas>
<script src="/scripts/canvas/first.js"></script>

The image above is produced with the following code:

`<page html>`
``` html
<canvas id="first"></canvas>
<script src="/scripts/canvas/first.js"></script>
```

[`/scripts/canvas/first.js`](/scripts/canvas/first.js)
``` javascript
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
```
