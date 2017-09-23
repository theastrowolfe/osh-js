importScripts("ffmpeg-openh264.js");


Module.ccall('avcodec_register_all');

var codec = Module.ccall('avcodec_find_decoder_by_name', 'number', ['string'], ["h264"]);

if (codec == 0) {
    console.error("Could not find libopenh264 codec");
}
self.onmessage = function (e) {
    /*var data = e.data;
    if (data === null) {
        decode_h264nal(h, 0, 0);
    } else {
        var byteArray = new Uint8Array(data);
        decode_h264nal(h, byteArray, byteArray.length);
    }*/
};