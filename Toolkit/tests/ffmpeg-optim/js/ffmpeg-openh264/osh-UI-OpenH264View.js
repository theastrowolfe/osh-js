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
 var videoView = new OSH.UI.View.FFMPEGView("videoContainer-id", {
    dataSourceId: videoDataSource.id,
    css: "video",
    cssSelected: "video-selected",
    name: "Video",
    useWorker:true
});
 */
OSH.UI.OpenH264View = OSH.UI.View.VideoView.extend({
    initialize: function (divId, options) {
        this._super(divId, options);

        this.fps = 0;
        var width = "640";
        var height = "480";

        this.nbFrames = 0;
        /*
         for 1920 x 1080 @ 25 fps = 7 MB/s
         1 frame = 0.28MB
         178 frames = 50MB
         */
        this.FLUSH_LIMIT  = 200;

        this.statistics = {
            videoStartTime: 0,
            videoPictureCounter: 0,
            windowStartTime: 0,
            windowPictureCounter: 0,
            fps: 0,
            fpsMin: 1000,
            fpsMax: -1000,
            fpsSinceStart: 0
        };

        this.useWorker = OSH.Utils.isWebWorker();
        this.resetCalled = true;
        this.useWebWorkerTransferableData = false;

        if (typeof options != "undefined") {
            if (options.width) {
                width = options.width;
            }

            if (options.height) {
                height = options.height;
            }

            this.useWorker = (typeof options.useWorker != "undefined") && (options.useWorker) && (OSH.Utils.isWebWorker());

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
        OSH.EventManager.observeDiv(this.divId, "click", function (event) {
            OSH.EventManager.fire(OSH.EventManager.EVENT.SELECT_VIEW, {
                dataSourcesIds: [self.dataSourceId],
                entityId: self.entityId
            });
        });

        if (this.useWorker) {
            this.initFFMPEG_DECODER_WORKER();
        } else {
            this.initFFMEG_DECODER();
        }
    },

    /**
     *
     * @param dataSourceId
     * @param data
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     */
    setData: function (dataSourceId, data) {
        this.decodeWorker(data.data);

       /* var pktData = data.data;
        var pktSize = pktData.length;

        this.resetCalled = false;

        if (this.useWorker) {
            this.decodeWorker(pktSize, pktData);
        } else {
            var decodedFrame = this.decode(pktSize, pktData);
            if(typeof decodedFrame != "undefined") {
                // adjust canvas size to fit to the decoded frame
                if(decodedFrame.frame_width != this.yuvCanvas.width) {
                    this.yuvCanvas.canvasElement.width = decodedFrame.frame_width;
                    this.yuvCanvas.width = decodedFrame.frame_width;
                }
                if(decodedFrame.frame_height != this.yuvCanvas.height) {
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
        }*/
    },


    /**
     *
     * @param $super
     * @param dataSourceIds
     * @param entityId
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     */
    selectDataView: function (dataSourceIds, entityId) {
        if (dataSourceIds.indexOf(this.dataSourceId) > -1 || (typeof this.entityId != "undefined") && this.entityId == entityId) {
            document.getElementById(this.divId).setAttribute("class", this.css + " " + this.cssSelected);
        } else {
            document.getElementById(this.divId).setAttribute("class", this.css);
        }
    },


    /**
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
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

    /**
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     */
    updateStatistics: function () {
        this.nbFrames++;

        var s = this.statistics;
        s.videoPictureCounter += 1;
        s.windowPictureCounter += 1;
        var now = Date.now();
        if (!s.videoStartTime) {
            s.videoStartTime = now;
        }
        var videoElapsedTime = now - s.videoStartTime;
        s.elapsed = videoElapsedTime / 1000;
        if (videoElapsedTime < 1000) {
            return;
        }

        if (!s.windowStartTime) {
            s.windowStartTime = now;
            return;
        } else if ((now - s.windowStartTime) > 1000) {
            var windowElapsedTime = now - s.windowStartTime;
            var fps = (s.windowPictureCounter / windowElapsedTime) * 1000;
            s.windowStartTime = now;
            s.windowPictureCounter = 0;

            if (fps < s.fpsMin) s.fpsMin = fps;
            if (fps > s.fpsMax) s.fpsMax = fps;
            s.fps = fps;
        }

        fps = (s.videoPictureCounter / videoElapsedTime) * 1000;
        s.fpsSinceStart = fps;
    },

    /**
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     */
    onAfterDecoded: function () {
    },

    //-- FFMPEG DECODING PART

    //-------------------------------------------------------//
    //---------- Web worker --------------------------------//
    //-----------------------------------------------------//

    /**
     * The worker code is located at the location js/workers/FFMPEGViewWorker.js.
     * This location cannot be changed. Be sure to have the right file at the right place.
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     * @param callback
     */
    initFFMPEG_DECODER_WORKER: function (callback) {

        this.worker = new Worker(window.OSH.BASE_WORKER_URL+'/osh-UI-OpenH264Worker.js');

        var self = this;
        this.worker.onmessage = function (e) {
            var decodedFrame = e.data;

            var width = 1920;
            var height = 1080;

            self.yuvCanvas.canvasElement.drawing = true;
            // adjust canvas size to fit to the decoded frame
            if (width != self.yuvCanvas.width) {
                self.yuvCanvas.canvasElement.width = width;
                self.yuvCanvas.width = width;
            }
            if (height != self.yuvCanvas.height) {
                self.yuvCanvas.canvasElement.height = height;
                self.yuvCanvas.height = height;
            }

            var ylen = width * height;
            var uvlen = (width / 2) * (height / 2);

            self.yuvCanvas.drawNextOuptutPictureGL({
                yData: decodedFrame.data.subarray(0, ylen),
                uData: decodedFrame.data.subarray(ylen, ylen + uvlen),
                vData: decodedFrame.data.subarray(ylen + uvlen, ylen + uvlen + uvlen),
                yDataPerRow: width,
                uDataPerRow: width / 2,
                vDataPerRow: width / 2,
                yRowCnt: height,
                uRowCnt: height / 2,
                vRowCnt: height / 2
            });
            self.updateStatistics();
            self.onAfterDecoded();
        }.bind(this);
    },

    /**
     *
     * @param pktSize
     * @param pktData
     * @instance
     * @memberof OSH.UI.View.FFMPEGView
     */
    decodeWorker: function (pktData) {
        var data = {
            type:'frame',
            data: pktData.buffer
        };
        this.worker.postMessage(data);
    }
});