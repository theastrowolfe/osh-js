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
 * @class OSH.UI.Styler.PointMarker
 * @type {OSH.UI.Styler}
 * @augments OSH.UI.Styler
 * @example
 * var pointMarker = new OSH.UI.Styler.PointMarker({
        location : {
            x : 1.42376557,
            y : 43.61758626,
            z : 100
        },
        locationFunc : {
            dataSourceIds : [androidPhoneGpsDataSource.getId()],
            handler : function(rec) {
                return {
                    x : rec.lon,
                    y : rec.lat,
                    z : rec.alt
                };
            }
        },
        orientationFunc : {
            dataSourceIds : [androidPhoneOrientationDataSource.getId()],
            handler : function(rec) {
                return {
                    heading : rec.heading
                };
            }
        },
        icon : 'images/cameralook.png',
        iconFunc : {
            dataSourceIds: [androidPhoneGpsDataSource.getId()],
            handler : function(rec,timeStamp,options) {
                if(options.selected) {
                    return 'images/cameralook-selected.png'
                } else {
                    return 'images/cameralook.png';
                };
            }
        }
    });
 */
OSH.UI.Styler.PointMarker = OSH.UI.Styler.extend({
	initialize : function(properties) {
		this._super(properties);
		this.initProperties(properties);
	},

	initProperties:function(properties) {
        this.location = null;
        this.orientation = {heading:0};
        this.icon = null;
        this.iconAnchor = [16,16];
        this.label = null;
        this.color = "#000000";

        this.options = {};

        this.updateProperties(properties);
	},

	updateProperties:function(properties) {
	    OSH.Utils.copyProperties(properties,this.properties);

        if(!isUndefinedOrNull(properties.location)){
            this.location = properties.location;
        }

        if(!isUndefinedOrNull(properties.orientation)){
            this.orientation = properties.orientation;
        }

        if(!isUndefinedOrNull(properties.icon)){
            this.icon = properties.icon;
        }

        if(!isUndefinedOrNull(properties.iconAnchor)){
            this.iconAnchor = properties.iconAnchor;
        }

        if(!isUndefinedOrNull(properties.label)){
            this.label = properties.label;
        }

        if(!isUndefinedOrNull(properties.color)){
            this.color = properties.color;
        }

        if(!isUndefinedOrNull(properties.locationFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.location = properties.locationFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "location";
            this.addFn(properties.locationFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.orientationFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.orientation = properties.orientationFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "orientation";
            this.addFn(properties.orientationFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.iconFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.icon = properties.iconFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "icon";
            this.addFn(properties.iconFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.labelFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.label = properties.labelFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "label";
            this.addFn(properties.labelFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.colorFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.color = properties.colorFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "color";
            this.addFn(properties.colorFunc.dataSourceIds,fn);
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
		if(!isUndefinedOrNull(view) && this.location !==null) {
			view.updateMarker(this,0,{});
		}
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
			if (!isUndefinedOrNull(view) && !isUndefinedOrNull(this.location)) {
			    this.lastTimeStamp = rec.timeStamp;
			    this.lastOptions = options;
			    this.lastData = {
                    lastTimeStamp : rec.timeStamp,
                    lastOptions : options,
                    location: this.location
                };
				view.updateMarker(this, rec.timeStamp, options);
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
            view.removeMarker(this);
        }
    },

    update:function(view) {
        if(!isUndefinedOrNull(view) && !isUndefinedOrNull(this.lastData)) {
            this.location = this.lastData.location;
            view.updateMarker(this,this.lastData.lastTimeStamp,this.lastData.lastOptions);
        }
    }

});