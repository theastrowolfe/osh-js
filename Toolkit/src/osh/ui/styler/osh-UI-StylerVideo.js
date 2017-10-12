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
 * @class OSH.UI.Styler.Video
 * @type {OSH.UI.Styler}
 * @augments OSH.UI.Styler
 * @example
 * var videoStyler = new OSH.UI.Styler.Video();
 */
OSH.UI.Styler.Video = OSH.UI.Styler.extend({
	initialize : function(properties) {
		this._super(properties);
		this.initProperties(properties);
	},

	initProperties:function(properties) {
        this.frame = null;
        this.options = {};

        this.updateProperties(properties);
	},

	updateProperties:function(properties) {
	    OSH.Utils.copyProperties(properties,this.properties,true);

        if(!isUndefinedOrNull(properties.frameFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.frame = properties.frameFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "frame";
            this.addFn(properties.frameFunc.dataSourceIds,fn);
        }
    },

	/**
	 *
	 * @param view
	 * @memberof OSH.UI.Styler.PointMarker
	 * @instance
	 */
	init: function(view) {
		this._super(view);
	},

	/**
	 *
	 * @param dataSourceId
	 * @param rec
	 * @param view
	 * @param options
	 * @memberof OSH.UI.Styler.PointMarker
	 * @instance
	 */
	setData: function(dataSourceId,rec,view,options) {
		if(this._super(dataSourceId,rec,view,options)) {
			if (!isUndefinedOrNull(view) && !isUndefinedOrNull(this.frame)) {
			    this.lastData = {
                    lastTimeStamp : rec.timeStamp,
                    lastOptions : options,
                    frame: this.frame
                };
				view.updateFrame(this, rec.timeStamp, options);
			}
		}
	},

	/**
	 *
	 * @memberof OSH.UI.Styler.PointMarker
	 * @instance
	 */
	clear:function(){
	},

	remove:function(view) {
        if(!isUndefinedOrNull(view)) {
            view.stopVideo(this);
        }
    },

    update:function(view) {
        if(!isUndefinedOrNull(view) && !isUndefinedOrNull(this.lastData)) {
            this.frame = this.lastData.frame;
            view.updateFrame(this,this.lastData.lastTimeStamp,this.lastData.lastOptions);
        }
    }
});