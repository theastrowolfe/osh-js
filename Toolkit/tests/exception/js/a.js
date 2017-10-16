function aNoCapture() {
    b();
}

function aCapture() {
    try {
        b();
    } catch(exception) {
        console.err(exception);
    }
}

function aNoCaptureWithError() {
    bWithError();
}