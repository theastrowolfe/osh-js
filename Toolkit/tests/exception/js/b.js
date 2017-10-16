function b() {
    throw new OSH.Exception.Exception("Test exception OSH", new Error("original error"));
}

function bWithError() {
    throw new Error("Test exception Error");
}