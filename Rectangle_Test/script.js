const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let rect = { x: 50, y: 50, width: 150, height: 100 };
let drag = false;
let mouseX, mouseY;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const borderWidth = 5;

    // Top border
    ctx.fillRect(rect.x, rect.y, rect.width, borderWidth);
    // Bottom border
    ctx.fillRect(rect.x, rect.y + rect.height - borderWidth, rect.width, borderWidth);
    // Left border
    ctx.fillRect(rect.x, rect.y, borderWidth, rect.height);
    // Right border
    ctx.fillRect(rect.x + rect.width - borderWidth, rect.y, borderWidth, rect.height);
}


function mouseDown(e) {
    mouseX = e.clientX - canvas.getBoundingClientRect().left;
    mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Check if we are on the left or right edge of the rectangle
    if (mouseX > rect.x + rect.width - 10 && mouseX < rect.x + rect.width + 10) {
        drag = 'right';
    } else if (mouseX > rect.x - 10 && mouseX < rect.x + 10) {
        drag = 'left';
    }
}

function mouseUp() {
    drag = false;
}

function mouseMove(e) {
    if (drag) {
        const dx = e.clientX - canvas.getBoundingClientRect().left - mouseX;
        mouseX = e.clientX - canvas.getBoundingClientRect().left;

        if (drag === 'right') {
            rect.width += dx;
        } else if (drag === 'left') {
            rect.x += dx;
            rect.width -= dx;
        }

        draw();
    }
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mousemove', mouseMove);

draw();
