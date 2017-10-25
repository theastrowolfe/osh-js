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
 var rangeSlider = new OSH.UI.Panel.RangeSliderPanel("rangeSlider-container",{
        startTime: "2015-02-16T07:58:00Z",
        endTime: "2015-02-16T08:09:00Z",
        refreshRate:1, // rate of data received
        dataSourcesId: [someDataSource.id],
 });
 */
OSH.UI.Panel.RangeSliderPanel = OSH.UI.Panel.extend({
	initialize: function (parentElementDivId, options) {
		this._super(parentElementDivId, options);
	},

	initPanel:function() {
		this._super();
        OSH.Utils.addCss(this.elementDiv,"osh-rangeslider");

        this.slider = document.createElement("div");
        var activateButtonDiv = document.createElement("div");
        var aTagActivateButton = document.createElement("i");
        activateButtonDiv.appendChild(aTagActivateButton);


        aTagActivateButton.setAttribute("class","fa fa-fw edit-icon");

        this.slider.setAttribute("class","slider");
        activateButtonDiv.setAttribute("class","osh-rangeslider-control");

        this.isActivated = false;
        var self = this;

        activateButtonDiv.addEventListener("click",function(event) {
        	if(!self.isActivated) {
				OSH.Utils.addCss(aTagActivateButton,"selected");
                self.activate();
			} else {
                OSH.Utils.removeCss(aTagActivateButton,"selected");
                self.deactivate();
			}
			self.isActivated = !self.isActivated;
        });

        document.getElementById(this.divId).appendChild(this.slider);
        document.getElementById(this.divId).appendChild(activateButtonDiv);

        var startTime = new Date().getTime();
        this.endTime = new Date("2055-01-01T00:00:00Z").getTime(); //01/01/2055
        this.slider.setAttribute('disabled', true);

        this.dataSourcesId = [];

        this.multi = false;
        // compute a refresh rate
        this.dataCount = 0;
        this.refreshRate = 10;

        if(!isUndefinedOrNull(this.options)) {
            if(!isUndefinedOrNull(this.options.startTime)) {
                startTime = new Date(this.options.startTime).getTime();
                //slider.removeAttribute('disabled');
            }

            if(!isUndefinedOrNull(this.options.endTime)) {
                this.endTime = new Date(this.options.endTime).getTime();
            }

            if(!isUndefinedOrNull(this.options.dataSourcesId)) {
                this.dataSourcesId = this.options.dataSourcesId;
            }
            if(!isUndefinedOrNull(this.options.refreshRate)) {
                this.refreshRate = this.options.refreshRate;
            }

        }

        noUiSlider.create(this.slider, {
            start: [startTime,this.endTime]/*,timestamp("2015-02-16T08:09:00Z")]*/,
            range: {
                min: startTime,
                max: this.endTime
            },
            //step:  1000* 60* 60,
            format: wNumb({
                decimals: 0
            }),
            behaviour: 'drag',
            connect: true,
            tooltips: [
                wNumb({
                    decimals: 1,
                    edit:function( value ){
                        var date = new Date(parseInt(value)).toISOString();
                        return date.split("T")[1].split("Z")[0];
                    }
                }),
                wNumb({
                    decimals: 1,
                    edit:function( value ){
                        var date = new Date(parseInt(value)).toISOString();
                        return date.split("T")[1].split("Z")[0];
                    }
                })
            ],
            pips: {
                mode: 'positions',
                values: [5,25,50,75],
                density: 1,
                //stepped: true,
                format: wNumb({
                    edit:function( value ){
                        return new Date(parseInt(value)).toISOString().replace(".000Z", "Z");
                    }
                })
            }
        });

        //noUi-handle noUi-handle-lower
        // start->update->end
        this.slider.noUiSlider.on("slide", function (values, handle) {
            self.update = true;
        });

        // listen for DataSourceId
        OSH.EventManager.observe(OSH.EventManager.EVENT.CURRENT_MASTER_TIME, function (event) {
            var filterOk = true;

            if(self.dataSourcesId.length > 0) {
                if(self.dataSourcesId.indexOf(event.dataSourceId) < 0) {
                    filterOk = false;
                }
            }

            if(filterOk && !self.lock && ((++self.dataCount)%self.refreshRate == 0)) {
                self.slider.noUiSlider.set([event.timeStamp]);
                self.dataCount = 0;
            }
        });
	},

	/**
	 * @instance
	 * @memberof OSH.UI.Panel.RangeSliderPanel
	 */
	deactivate:function() {
		this.slider.setAttribute('disabled', true);
		this.lock = false;
		if(this.update) {
			var values = this.slider.noUiSlider.get();
			OSH.EventManager.fire(OSH.EventManager.EVENT.DATASOURCE_UPDATE_TIME, {
				startTime: new Date(parseInt(values[0])).toISOString(),
				endTime: new Date(parseInt(values[1])).toISOString()
			});
		}
		this.update = false;
	},

	/**
	 * @instance
	 * @memberof OSH.UI.Panel.RangeSliderPanel
	 */
	activate: function() {
		this.slider.removeAttribute('disabled');
		this.lock = true;
	}
});