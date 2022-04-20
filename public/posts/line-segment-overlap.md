# Finding intersections between colinear line segments

While playing around with AABB collisions I needed to find a way to calculate the overlap between two ranges, one for the x axis and one for the y axis. After some drawings I eventually came up with a simple algorithm to calculate overlap on a single axis.

This algorithm requires the use of localized 1 dimensional vectors. The simplest way to represent them is by specifying a `start` and `end` value. This means we can calculate their length by using `end - start`, and doing so can result in negative lengths, which is important for this algorithm.

<hr>

## Algorithm

Let segment `AB = (a, b)` such that `a < b`
Let segment `CD = (c, d)` such that `c < d`
Let `a`, `b`, `c`, and `d` be values on the real number line

Let `overlap = ( max(a, c), min(b, d) )`
If `overlap end - overlap start < 0` then there is no overlap/collision and `overlap` represents a localized vector of the gap between segments
If `overlap end - overlap start >= 0` then there is a overlap/collision and `overlap` represents a localized vector of the overlap of the segments

<hr>

## Visualization

Here is a visual animation of the algorithm. Each of the horizontal gray lines represent the same axis, so you can imagine that all of these lines exist colinearly on the same line. This animation just separates them so you can see them better.

- The first two (white) lines represent the input segments to check for overlap.
- The second (cyan) line represents the 1D local vector from a to d
- The third (magenta) line represents the 1D local vector from c to b
- The fourth (green/red) is the final overlap of the two lines

<script src="/scripts/canvas/2d.js"></script>
<canvas id="numberline"></canvas>
<script src="/scripts/canvas/collision/number-line.js"></script>

Every case should be visible in the animation if you pause at the right time with the exception of when the segments are equal to eachother. The algorithm will still work in this case, and it will return `overlap = AB = CD`.

Each of the cases are as follows
- overlap left
- overlap right
- engulfed
- engulfing
- disjoint left
- disjoint right

The length of AB oscillates at exactly 4x the frequency of the back and forth motion, so this should produce a perfect loop that should not fall out of sync.

<hr>

## Implementation

Here is an example of the algorithm written in Javascript:

``` javascript
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
```

This will return a tuple of the `start` and `end` of a 1D localized array. You will need to manually check if `end - start` is negative (meaning no overlap/collision).

As you can see this implementation also ensures that `a < b` and `c < d`, but you could also throw an error and just require the implementer to account for this.
