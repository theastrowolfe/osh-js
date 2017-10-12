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
 var videoView = new OSH.UI.Mp4View("videoContainer-id", [{
        styler: new OSH.UI.Styler.Video({
            frameFunc: {
                dataSourceIds: [videoDataSource.id],
                handler: function (rec, timestamp, options) {
                    return rec;
                }
            }
        }),
        name: "MP4 ViDEO",
        entityId:entityId
    }]
    , {
    css: "video",
    cssSelected: "video-selected",
    name: "Video"
 });
 */
OSH.UI.Mp4View = OSH.UI.VideoView.extend({
    initialize: function (divId, viewItems, options) {
        this._super(divId, viewItems, options);

        var width = "640";
        var height = "480";

        // creates video tag element
        this.video = document.createElement("video");
        this.video.setAttribute("control", '');

        // appends <video> tag to <div>
        document.getElementById(this.divId).appendChild(this.video);

        this.init = false;
        this.mp4box = new MP4Box();
    },

    /**
     *
     * @param styler
     * @instance
     * @memberof OSH.UI.Mp4View
     */
    updateFrame: function (styler) {
        var frame = styler.frame;
        if (!this.init) {
            this.init = true;
            frame.fileStart = 0;

            var self = this;

            this.mp4box.onError = function (e) {
                console.error("MP4 error");
            };
            this.mp4box.onReady = function (info) {
                OSH.Asserts.checkArrayIndex(info.tracks, 0);
                self.createMediaSource(info.tracks[0],function(sourcebuffer){
                    self.sourcebuffer = sourcebuffer;
                });
            };
            self.mp4box.appendBuffer(frame);
            self.mp4box.flush();
        } else if(!isUndefinedOrNull(this.sourcebuffer)){
            console.log("append");
            if (this.sourcebuffer.updating || this.queue.length > 0) {
                this.queue.push(frame);
            } else {
                this.sourcebuffer.appendBuffer(frame);
            }
        }
    },

    createMediaSource: function (mp4track,callback) {
        if (!'MediaSource' in window) {
            throw new ReferenceError('There is no MediaSource property in window object.');
        }

        var track_id = mp4track.id;
        var codec = mp4track.codec;
        var mime = 'video/mp4; codecs=\"' + codec + '\"';

        if (!MediaSource.isTypeSupported(mime)) {
            console.log('Can not play the media. Media of MIME type ' + mime + ' is not supported.');
            throw ('Media of type ' + mime + ' is not supported.');
        }

        this.queue = [];
        var mediaSource = new MediaSource();
        this.video.src =  window.URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', function(e) {
            mediaSource.duration = 10000000;
            var playPromise = this.video.play();

            // In browsers that don’t yet support this functionality,
            // playPromise won’t be defined.

            if (playPromise !== undefined) {
                playPromise.then(function() {
                    // Automatic playback started!
                }).catch(function(error) {
                    // Automatic playback failed.
                    // Show a UI element to let the user manually start playback.
                });
            }


            /**
             * avc1.42E01E: H.264 Constrained Baseline Profile Level 3
             avc1.4D401E: H.264 Main Profile Level 3
             avc1.64001E: H.264 High Profile Level 3
             */
            var sourcebuffer = mediaSource.addSourceBuffer(mime);

            sourcebuffer.addEventListener('updatestart', function(e) {
                /*console.log('updatestart: ' + mediaSource.readyState);*/
                if(this.queue.length > 0 && !this.buffer.updating) {
                    sourcebuffer.appendBuffer(this.queue.shift());
                }
            }.bind(this));
            sourcebuffer.addEventListener('error', function(e) { /*console.log('error: ' + mediaSource.readyState);*/ });
            sourcebuffer.addEventListener('abort', function(e) { /*console.log('abort: ' + mediaSource.readyState);*/ });

            sourcebuffer.addEventListener('updateend', function() { // Note: Have tried 'updateend'
                if(this.queue.length > 0) {
                    sourcebuffer.appendBuffer(this.queue.shift());
                }
            }.bind(this));

            callback(sourcebuffer);
        }.bind(this), false);

        mediaSource.addEventListener('sourceopen', function(e) { /*console.log('sourceopen: ' + mediaSource.readyState);*/ });
        mediaSource.addEventListener('sourceended', function(e) { /*console.log('sourceended: ' + mediaSource.readyState);*/ });
        mediaSource.addEventListener('sourceclose', function(e) { /*console.log('sourceclose: ' + mediaSource.readyState);*/ });
        mediaSource.addEventListener('error', function(e) { /*console.log('error: ' + mediaSource.readyState);*/ });

    }

});