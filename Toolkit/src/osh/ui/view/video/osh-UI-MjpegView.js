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
 var videoView = new OSH.UI.MjpegView("containerId", [{
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
    }],{
    css: "video",
    cssSelected: "video-selected",
    name: "Video"
});
 */
OSH.UI.MjpegView = OSH.UI.VideoView.extend({
    initialize: function (divId, viewItems,options) {
        this._super(divId, viewItems,options);

        // creates video tag element
        this.imgTag = document.createElement("img");
        this.imgTag.setAttribute("id", "dataview-" + OSH.Utils.randomUUID());

        // rotation option
        this.rotation = 0;
        if (!isUndefinedOrNull(options) && !isUndefinedOrNull(options.rotation)) {
            this.rotation = options.rotation * Math.PI / 180;
            this.canvas = document.createElement('canvas');
            this.canvas.width = 640;
            this.canvas.height = 480;
            var ctx = this.canvas.getContext('2d');
            ctx.translate(0, 480);
            ctx.rotate(this.rotation);
            document.getElementById(this.divId).appendChild(this.canvas);
        } else {
            // appends <img> tag to <div>
            document.getElementById(this.divId).appendChild(this.imgTag);
            OSH.Utils.addCss(document.getElementById(this.divId), "video");
        }
    },

    /**
     *
     * @param styler
     * @instance
     * @memberof OSH.UI.MjpegView
     */
    updateFrame: function (styler) {
        this._super(styler);
        var oldBlobURL = this.imgTag.src;
        this.imgTag.src = styler.frame;
        window.URL.revokeObjectURL(oldBlobURL);
    },

    /**
     * @instance
     * @memberof OSH.UI.MjpegView
     */
    reset: function () {
        this.imgTag.src = "";
    }
});

