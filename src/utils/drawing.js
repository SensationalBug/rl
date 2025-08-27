/**
 * Draws a polygon on a given canvas.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {number} x - The x-coordinate of the polygon's center.
 * @param {number} y - The y-coordinate of the polygon's center.
 * @param {number} radius - The radius of the circumscribed circle of the polygon.
 * @param {number} sides - The number of sides for the polygon.
 */
export function drawPolygon(ctx, x, y, radius, sides) {
    if (sides < 3) return; // A polygon must have at least 3 sides

    ctx.beginPath();
    ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));

    for (let i = 1; i <= sides; i++) {
        ctx.lineTo(
            x + radius * Math.cos(i * 2 * Math.PI / sides),
            y + radius * Math.sin(i * 2 * Math.PI / sides)
        );
    }

    ctx.closePath();

    // The fill and stroke styles should be set before calling this function
    // to allow for different colors.
    ctx.fill();
    ctx.stroke();
}
