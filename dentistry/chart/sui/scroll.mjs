let previousWidth = null;
let previousPosition = null;

export function blockScrollOnBody() {
    previousWidth = document.body.style.width;
    previousPosition = document.body.style.position;
    document.body.style.width = document.body.clientWidth + 'px';
    document.body.style.position = 'fixed';
}

export function unblockScrollOnBody() {
    document.body.style.width = previousWidth;
    document.body.style.position = previousPosition;
}
