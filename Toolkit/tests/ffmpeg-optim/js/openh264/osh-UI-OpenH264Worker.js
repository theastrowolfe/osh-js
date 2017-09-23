importScripts("decoder.js");

var open_decoder = Module.cwrap('open_decoder', 'number', null);
var close_decoder = Module.cwrap('close_decoder', null, ['number']);
var decode_h264buffer = Module.cwrap('decode_h264buffer', 'number', ['number','array','number']);
var decode_h264nal = Module.cwrap('decode_nal', 'number', ['number','array','number']);

var h = open_decoder();

self.onmessage = function (e) {
    var data = e.data;
    if (data === null) {
        decode_h264nal(h, 0, 0);
    } else {
        var byteArray = new Uint8Array(data);
        decode_h264nal(h, byteArray, byteArray.length);
    }
};