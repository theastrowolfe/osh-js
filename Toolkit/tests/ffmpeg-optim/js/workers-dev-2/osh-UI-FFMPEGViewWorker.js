importScripts("ffmpeg-h264.js");
// register all compiled codecs
Module.ccall('avcodec_register_all');

// find h264 decoder
var codec = Module.ccall('avcodec_find_decoder_by_name', 'number', ['string'], ["h264"]);
if (codec == 0) {
    console.error("Could not find H264 codec");
}

// init codec and conversion context
self.av_ctx = _avcodec_alloc_context3(codec);

// open codec
var ret = _avcodec_open2(self.av_ctx, codec, 0);
if (ret < 0) {
    console.error("Could not initialize codec");
}


// allocate packet
self.av_pkt = Module._malloc(96);
self.av_pktData = Module._malloc(1024 * 3000);
_av_init_packet(self.av_pkt);
Module.setValue(self.av_pkt + 24, self.av_pktData, '*');

// allocate video frame
self.av_frame = _av_frame_alloc();
if (!self.av_frame)
    alert("Could not allocate video frame");

// init decode frame function
self.got_frame = Module._malloc(4);

self.signed = 0;
self.outputBuffer = null;
self.id = Math.floor((Math.random() * 10000) + 1);

self.onmessage = function (e) {
    // release from main thread
    if(!self.init) {
        if(computeSize(e.data.data.byteLength, e.data.data)) {
            initBuffers();
            self.init = true;
        }
    }

    if(self.init) {
        var  processData = function(event) {
            if (event.data.release) {
                self.outputBuffer = event.data.outputBuffer;
                self.outputBuffer.inUse = false;
            } else if (!self.outputBuffer.inUse) {
                self.innerWorkerDecode(event.data.data.byteLength, new Uint8Array(event.data.data, event.data.byteOffset, event.data.data.byteLength));
            } else {
                setTimeout(function(){
                    processData(event);
                },5);
            }
        };

        processData(e);
    }
};

function computeSize(pktSize,pktData) {
    if (pktSize > self.maxPktSize) {
        // dealloc old allocation
        Module._free(this.av_pktData);
        self.av_pktData = Module._malloc(pktSize);
        Module.setValue(self.av_pkt + 24, self.av_pktData, '*');
        self.maxPktSize = pktSize;
    }
    // prepare packet
    Module.setValue(self.av_pkt + 28, pktSize, 'i32');
    Module.writeArrayToMemory(pktData, self.av_pktData);

    // decode next frame
    if (_avcodec_decode_video2(self.av_ctx, self.av_frame, self.got_frame, self.av_pkt) < 0) {
        //console.log("Error while decoding frame");
        return false;
    }

    if (Module.getValue(self.got_frame, 'i8') == 0) {
        return false;
    }

    var decoded_frame = self.av_frame;
    var frame_width = Module.getValue(decoded_frame + 68, 'i32');
    var frame_height = Module.getValue(decoded_frame + 72, 'i32');
    self.width = frame_width;
    self.height = frame_height;
    return true;
}

function initBuffers() {
    self.outputBuffer = {
        y: new Uint8Array(new ArrayBuffer(self.width * self.height)),
        u: new Uint8Array(new ArrayBuffer((self.width * self.height) / 4)),
        v: new Uint8Array(new ArrayBuffer((self.width * self.height) / 4)),
        inUse : false
    };
}

function innerWorkerDecode(pktSize, pktData) {
    // prepare packet
    Module.setValue(self.av_pkt + 28, pktSize, 'i32');
    Module.writeArrayToMemory(pktData, self.av_pktData);

    // decode next frame
    var len = _avcodec_decode_video2(self.av_ctx, self.av_frame, self.got_frame, self.av_pkt);
    if (len < 0) {
        console.log("Error while decoding frame");
        return;
    }

    if (Module.getValue(self.got_frame, 'i8') == 0) {
        //console.log("No frame");
        return;
    }

    var decoded_frame = self.av_frame;
    var frame_width = Module.getValue(decoded_frame + 68, 'i32');
    var frame_height = Module.getValue(decoded_frame + 72, 'i32');
    //console.log("Decoded Frame, W=" + frame_width + ", H=" + frame_height);

    // copy Y channel to canvas
    var frameYDataPtr = Module.getValue(decoded_frame, '*');
    var frameUDataPtr = Module.getValue(decoded_frame + 4, '*');
    var frameVDataPtr = Module.getValue(decoded_frame + 8, '*');


    var tmpY = new Uint8Array(Module.HEAPU8.buffer, frameYDataPtr, frame_width * frame_height);
    var tmpU = new Uint8Array(Module.HEAPU8.buffer, frameUDataPtr, (frame_width * frame_height) / 4);
    var tmpV = new Uint8Array(Module.HEAPU8.buffer, frameVDataPtr, (frame_width * frame_height) / 4);

    self.outputBuffer.y.set(tmpY);
    self.outputBuffer.u.set(tmpU);
    self.outputBuffer.v.set(tmpV);

    tmpY = null;
    tmpU = null;
    tmpV = null;

    frameYDataPtr = null;
    frameUDataPtr = null;
    frameVDataPtr = null;

    self.outputBuffer.inUse = true;
    self.postMessage({
            outputBuffer: self.outputBuffer,
            width: self.width,
            height:self.height
        },
        [
            self.outputBuffer.y.buffer,
            self.outputBuffer.u.buffer,
            self.outputBuffer.v.buffer
        ]);
}