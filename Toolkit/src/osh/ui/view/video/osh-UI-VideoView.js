/***************************** BEGIN LICENSE BLOCK ***************************

 The contents of this file are subject to the Mozilla Public License, v. 2.0.
 If a copy of the MPL was not distributed with this file, You can obtain one
 at http://mozilla.org/MPL/2.0/.

 Software distributed under the License is distributed on an "AS IS" basis,
 WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 for the specific language governing rights and limitations under the License.

 Copyright (C) 2015-2017 Sensia Software LLC. All Rights Reserved.

 Author: Mathieu Dhainaut <mathieu.dhainaut@gmail.com>
 Author: Alex Robin <alex.robin@sensiasoft.com>

 ******************************* END LICENSE BLOCK ***************************/

OSH.UI.VideoView = OSH.UI.View.extend({

    initialize : function(parentElementDivId, viewItems,properties) {
        this._super(parentElementDivId, viewItems, properties);

        this.fps = 0;
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

        this.firstFrame = true;
    },

    init:function(parentElementDivId,viewItems,options) {
        this._super(parentElementDivId,viewItems,options);

        // defines default options if not defined
        if(isUndefinedOrNull(options.showFps)) {
            this.options.showFps = false;
        }
        if(isUndefinedOrNull(options.keepRatio)) {
            this.options.keepRatio = false;
        }

        this.updateShowFps();
    },

    updateShowFps:function() {
        var showFps = (!isUndefinedOrNull(this.options) && !isUndefinedOrNull(this.options.showFps) && this.options.showFps);

        if(showFps && isUndefinedOrNull(this.statsElt)) {

            // create stats block
            // <div id="stats-h264" class="stats"></div>
            this.statsElt = document.createElement("div");
            this.statsElt.setAttribute("class", "stats");

            // appends to root
            this.elementDiv.appendChild(this.statsElt);

            this.statsElt.innerHTML = "Fps: 0";

            OSH.Utils.addCss(this.elementDiv, "video");
            var self = this;

            this.onAfterDecoded = function () {
                this.statsElt.innerHTML = "Fps: " + this.statistics.fps.toFixed(1) + "";
            };
        } else if(!showFps && !isUndefinedOrNull(this.statsElt)) {
            this.elementDiv.removeChild(this.statsElt);
            this.statsElt = null;
            this.onAfterDecoded = function () {};
        }
    },

    /**
     * @instance
     * @memberof OSH.UI.VideoView
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
     * @memberof OSH.UI.VideoView
     */
    onAfterDecoded: function () {
    },

    updateFrame:function(styler) {
        if(this.firstFrame) {
            OSH.EventManager.observeDiv(this.divId,"click",function(event) {
                OSH.EventManager.fire(OSH.EventManager.EVENT.SELECT_VIEW, {
                    dataSourcesIds: styler.getDataSourcesIds(),
                    entityId: styler.viewItem.entityId
                });
            });
            this.firstFrame = false;
        }
    },

    /**
     *
     * @param $super
     * @param dataSourceIds
     * @param entityId
     * @instance
     * @memberof OSH.UI.H264View
     */
    selectDataView: function(dataSourceIds,entityId) {
        var currentDataSources= this.getDataSourcesId();
        if(OSH.Utils.isArrayIntersect(dataSourceIds,currentDataSources)) {
            document.getElementById(this.divId).setAttribute("class",this.css+" "+this.cssSelected);
        } else {
            document.getElementById(this.divId).setAttribute("class",this.css);
        }
    },

    stopVideo:function() {

    },

    getType: function()  {
        return OSH.UI.View.ViewType.VIDEO;
    },

    updateProperties: function (properties) {
        this._super(properties);
        if (!isUndefinedOrNull(properties)) {
            if(!isUndefinedOrNull(properties.showFps)) {
                this.options.showFps = properties.showFps;
                this.updateShowFps();
            }
        }
    }
});