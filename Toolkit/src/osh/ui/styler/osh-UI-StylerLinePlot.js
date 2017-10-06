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
 * @class OSH.UI.Styler.LinePlot
 * @type {OSH.UI.Style}
 * @augments OSH.UI.Styler
 */
OSH.UI.Styler.LinePlot = OSH.UI.Styler.extend({
	initialize : function(properties) {
		this._super(properties);
		this.xLabel = "";
		this.yLabel = "";
		this.color = "#1f77b5";
		this.stroke = 1;
		this.x = 0;
		this.y = [];

        this.updateProperties(properties);
	},

    updateProperties:function(properties) {
        OSH.Utils.copyProperties(properties,this.properties,true);

        if(!isUndefinedOrNull(properties.stroke)){
            this.stroke = properties.stroke;
        }

        if(!isUndefinedOrNull(properties.color)){
            this.color = properties.color;
        }

        if(!isUndefinedOrNull(properties.x)){
            this.x = properties.x;
        }

        if(!isUndefinedOrNull(properties.y)){
            this.y = properties.y;
        }

        if(!isUndefinedOrNull(properties.strokeFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.stroke = properties.strokeFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "stroke";
            this.addFn(properties.strokeFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.colorFunc)) {
            var fn = function(rec,timeStamp,options) {
                this.color = properties.colorFunc.handler(rec,timeStamp,options);
            }.bind(this);
            fn.fnName = "color";
            this.addFn(properties.colorFunc.dataSourceIds,fn);
        }

        if(!isUndefinedOrNull(properties.valuesFunc)) {
            var fn = function(rec,timeStamp,options) {
                var values = properties.valuesFunc.handler(rec,timeStamp,options);
                this.x = values.x;
                this.y = values.y;
            }.bind(this);
            fn.fnName = "values";
            this.addFn(properties.valuesFunc.dataSourceIds,fn);
        }
    },

	/**
	 * @param $super
	 * @param dataSourceId
	 * @param rec
	 * @param view
	 * @param options
	 * @instance
	 * @memberof OSH.UI.Styler.Curve
	 */
	setData: function(dataSourceId,rec,view,options) {
		if(this._super(dataSourceId,rec,view,options)) {
			//if(typeof(view) != "undefined" && view.hasOwnProperty('updateMarker')){
			if(typeof(view) != "undefined") {
                this.lastData = {
                    lastTimeStamp : rec.timeStamp,
                    lastOptions : options,
                    x: this.x,
					y: this.y
                };
				view.updateLinePlot(this,rec.timeStamp,options);
			}
		}
	},

    /**
     *
     * @memberof OSH.UI.Styler.StylerLinePlot
     * @instance
     */
    clear:function(){
    },

    remove:function(view) {
        if(!isUndefinedOrNull(view)) {
            view.removeLinePlot(this);
        }
    },

    update:function(view) {
        if(!isUndefinedOrNull(view) && !isUndefinedOrNull(this.lastData)) {
            this.x = this.lastData.x;
            this.y = this.lastData.y;
            view.updateLinePlot(this,this.lastData.lastTimeStamp,this.lastData.lastOptions);
        }
    }
});