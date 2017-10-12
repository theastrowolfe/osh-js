/***************************** BEGIN LICENSE BLOCK ***************************

 The contents of this file are subject to the Mozilla Public License, v. 2.0.
 If a copy of the MPL was not distributed with this file, You can obtain one
 at http://mozilla.org/MPL/2.0/.

 Software distributed under the License is distributed on an "AS IS" basis,
 WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 for the specific language governing rights and limitations under the License.

 Copyright (C) 2015-2017 Mathieu Dhainaut. All Rights Reserved.

 Author: Mathieu Dhainaut <mathieu.dhainaut@gmail.com>

 ******************************* END LICENSE BLOCK ***************************/

/**
 * @classdesc
 * @class
 * @type {OSH.UI.View}
 * @augments OSH.UI.View
 * @example
 var videoView = new OSH.UI.FFMPEGView("videoContainer-id", [{
        styler: new OSH.UI.Styler.Video({
            frameFunc: {
                dataSourceIds: [videoDataSource.id],
                handler: function (rec, timestamp, options) {
                    return rec;
                }
            }
        }),
        name: "H264 ViDEO",
        entityId:entityId
    }], {
    css: "video",
    cssSelected: "video-selected",
    name: "Video",
    useWorker:true
});
 */
OSH.UI.FFMPEGView = OSH.UI.VideoView.extend({
    initialize: function (divId, viewItems,options) {
        this._super(divId, viewItems,options);

        this.useWorker = OSH.Utils.isWebWorker();
        this.resetCalled = true;
        this.useWebWorkerTransferableData = false;

        var width = 1920;
        var height = 1080;

        if (!isUndefinedOrNull(options)) {
            if (options.width) {
                width = options.width;
            }

            if (options.height) {
                height = options.height;
            }

            this.useWorker = (!isUndefinedOrNull(options.useWorker)) && (options.useWorker) && (OSH.Utils.isWebWorker());

            if(!isUndefinedOrNull(options.adjust) && options.adjust) {
                var divElt = document.getElementById(this.divId);
                if(divElt.offsetWidth < width) {
                    width = divElt.offsetWidth;
                }
                if(divElt.offsetHeight < height) {
                    height = divElt.offsetHeight;
                }
            }

            if(!isUndefinedOrNull(options.useWebWorkerTransferableData) &&  options.useWebWorkerTransferableData) {
                this.useWebWorkerTransferableData = options.useWebWorkerTransferableData;
            }
        }

        // create webGL canvas
        this.yuvCanvas = new YUVCanvas({width: width, height: height, contextOptions: {preserveDrawingBuffer: true}});
        var domNode = document.getElementById(this.divId);

        domNode.appendChild(this.yuvCanvas.canvasElement);

        // add selection listener
        var self = this;

        if (this.useWorker) {
            this.initFFMPEG_DECODER_WORKER();
        } else {
            this.initFFMEG_DECODER();
        }
    },

    /**
     *
     * @param styler
     * @instance
     * @memberof OSH.UI.FFMPEGView
     */
    updateFrame: function (styler) {
        this._super(styler);

        var pktData = styler.frame;
        var pktSize = pktData.length;

        this.resetCalled = false;

        if (this.useWorker) {
            this.decodeWorker(pktSize, pktData);
        } else {
            var decodedFrame = this.decode(pktSize, pktData);
            if(!isUndefinedOrNull(decodedFrame)) {
                // adjust canvas size to fit to the decoded frame
                if(decodedFrame.frame_width !== this.yuvCanvas.width) {
                    this.yuvCanvas.canvasElement.width = decodedFrame.frame_width;
                    this.yuvCanvas.width = decodedFrame.frame_width;
                }
                if(decodedFrame.frame_height !== this.yuvCanvas.height) {
                    this.yuvCanvas.canvasElement.height = decodedFrame.frame_height;
                    this.yuvCanvas.height = decodedFrame.frame_height;
                }

                this.yuvCanvas.drawNextOuptutPictureGL({
                    yData: decodedFrame.frameYData,
                    yDataPerRow: decodedFrame.frame_width,
                    yRowCnt: decodedFrame.frame_height,
                    uData: decodedFrame.frameUData,
                    uDataPerRow: decodedFrame.frame_width / 2,
                    uRowCnt: decodedFrame.frame_height / 2,
                    vData: decodedFrame.frameVData,
                    vDataPerRow: decodedFrame.frame_width / 2,
                    vRowCnt: decodedFrame.frame_height / 2
                });

                this.updateStatistics();
                this.onAfterDecoded();
            }
        }

        //check for flush
        this.checkFlush();
    },


    /**
     * @instance
     * @memberof OSH.UI.FFMPEGView
     */
    reset: function () {
        _avcodec_flush_buffers(this.av_ctx);
        // clear canvas
        this.resetCalled = true;
        var nodata = new Uint8Array(1);
        this.yuvCanvas.drawNextOuptutPictureGL({
            yData: nodata,
            yDataPerRow: 1,
            yRowCnt: 1,
            uData: nodata,
            uDataPerRow: 1,
            uRowCnt: 1,
            vData: nodata,
            vDataPerRow: 1,
            vRowCnt: 1
        });
    },

    //-- FFMPEG DECODING PART

    //-------------------------------------------------------//
    //---------- Web worker --------------------------------//
    //-----------------------------------------------------//

    /**
     * The worker code is located at the location js/workers/FFMPEGViewWorker.js.
     * This location cannot be changed. Be sure to have the right file at the right place.
     * @instance
     * @memberof OSH.UI.FFMPEGView
     * @param callback
     */
    initFFMPEG_DECODER_WORKER: function (callback) {
        this.worker = new Worker(window.OSH.BASE_WORKER_URL+'/osh-UI-FFMPEGViewWorker.js');

        var self = this;
        this.worker.onmessage = function (e) {
            var decodedFrame = e.data;

            if (!this.resetCalled) {
                self.yuvCanvas.canvasElement.drawing = true;
                // adjust canvas size to fit to the decoded frame
                if(decodedFrame.frame_width != self.yuvCanvas.width) {
                    self.yuvCanvas.canvasElement.width = decodedFrame.frame_width;
                    self.yuvCanvas.width = decodedFrame.frame_width;
                }
                if(decodedFrame.frame_height != self.yuvCanvas.height) {
                    self.yuvCanvas.canvasElement.height = decodedFrame.frame_height;
                    self.yuvCanvas.height = decodedFrame.frame_height;
                }

                self.yuvCanvas.drawNextOuptutPictureGL({
                    yData: decodedFrame.frameYData,
                    yDataPerRow: decodedFrame.frame_width,
                    yRowCnt: decodedFrame.frame_height,
                    uData: decodedFrame.frameUData,
                    uDataPerRow: decodedFrame.frame_width / 2,
                    uRowCnt: decodedFrame.frame_height / 2,
                    vData: decodedFrame.frameVData,
                    vDataPerRow: decodedFrame.frame_width / 2,
                    vRowCnt: decodedFrame.frame_height / 2
                });
                self.yuvCanvas.canvasElement.drawing = false;

                self.updateStatistics();
                self.onAfterDecoded();
            }
        }.bind(this);
    },

    /**
     *
     * @param pktSize
     * @param pktData
     * @instance
     * @memberof OSH.UI.FFMPEGView
     */
    decodeWorker: function (pktSize, pktData) {
        var data = {
            pktSize: pktSize,
            pktData: pktData.buffer,
            byteOffset: pktData.byteOffset
        };

        if (this.useWebWorkerTransferableData) {
            this.worker.postMessage(data, [data.pktData]);
        } else {
            // no transferable data
            // a copy of the data to be made before being sent to the worker. That could be slow for a large amount of data.
            this.worker.postMessage(data);
        }
    },

    checkFlush: function() {
        if(!this.useWorker && this.nbFrames >= this.FLUSH_LIMIT) {
            this.nbFrames = 0;
            _avcodec_flush_buffers(this.av_ctx);
        }
    },

    //-------------------------------------------------------//
    //---------- No Web worker -----------------------------//
    //-----------------------------------------------------//

    /**
     * @instance
     * @memberof OSH.UI.FFMPEGView
     */
    initFFMEG_DECODER: function () {
        // register all compiled codecs
        Module.ccall('avcodec_register_all');

        // find h264 decoder
        var codec = Module.ccall('avcodec_find_decoder_by_name', 'number', ['string'], ["h264"]);
        if (codec == 0)
        {
            console.error("Could not find H264 codec");
            return;
        }

        // init codec and conversion context
        this.av_ctx = _avcodec_alloc_context3(codec);

        // open codec
        var ret = _avcodec_open2(this.av_ctx, codec, 0);
        if (ret < 0)
        {
            console.error("Could not initialize codec");
            return;
        }

        // allocate packet
        this.av_pkt = Module._malloc(96);
        this.av_pktData = Module._malloc(1024*150);
        _av_init_packet(this.av_pkt);
        Module.setValue(this.av_pkt+24, this.av_pktData, '*');

        // allocate video frame
        this.av_frame = _avcodec_alloc_frame();
        if (!this.av_frame)
            alert("Could not allocate video frame");

        // init decode frame function
        this.got_frame = Module._malloc(4);
        this.maxPktSize = 1024 * 50;


    },

    /**
     *
     * @param pktSize
     * @param pktData
     * @returns {{frame_width: *, frame_height: *, frameYDataPtr: *, frameUDataPtr: *, frameVDataPtr: *, frameYData: Uint8Array, frameUData: Uint8Array, frameVData: Uint8Array}}
     * @instance
     * @memberof OSH.UI.FFMPEGView
     */
    decode: function (pktSize, pktData) {
        if(pktSize > this.maxPktSize) {
            this.av_pkt = Module._malloc(96);
            this.av_pktData = Module._malloc(pktSize);
            _av_init_packet(this.av_pkt);
            Module.setValue(this.av_pkt + 24, this.av_pktData, '*');
            this.maxPktSize = pktSize;
        }
        // prepare packet
        Module.setValue(this.av_pkt + 28, pktSize, 'i32');
        Module.writeArrayToMemory(pktData, this.av_pktData);

        // decode next frame
        var len = _avcodec_decode_video2(this.av_ctx, this.av_frame, this.got_frame, this.av_pkt);
        if (len < 0) {
            console.log("Error while decoding frame");
            return;
        }

        if (Module.getValue(this.got_frame, 'i8') == 0) {
            //console.log("No frame");
            return;
        }

        var decoded_frame = this.av_frame;
        var frame_width = Module.getValue(decoded_frame + 68, 'i32');
        var frame_height = Module.getValue(decoded_frame + 72, 'i32');
        //console.log("Decoded Frame, W=" + frame_width + ", H=" + frame_height);

        // copy Y channel to canvas
        var frameYDataPtr = Module.getValue(decoded_frame, '*');
        var frameUDataPtr = Module.getValue(decoded_frame + 4, '*');
        var frameVDataPtr = Module.getValue(decoded_frame + 8, '*');

        return {
            frame_width: frame_width,
            frame_height: frame_height,
            frameYDataPtr: frameYDataPtr,
            frameUDataPtr: frameUDataPtr,
            frameVDataPtr: frameVDataPtr,
            frameYData: new Uint8Array(Module.HEAPU8.buffer, frameYDataPtr, frame_width * frame_height),
            frameUData: new Uint8Array(Module.HEAPU8.buffer, frameUDataPtr, frame_width / 2 * frame_height / 2),
            frameVData: new Uint8Array(Module.HEAPU8.buffer, frameVDataPtr, frame_width / 2 * frame_height / 2)
        };
    }
});