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
 * @class OSH.UI.Nvd3CurveChartView
 * @type {OSH.UI.View}
 * @augments OSH.UI.ChartView
 * @example
// Chart View
var windSpeedChartView = new OSH.UI.Nvd3CurveChartView(chartDialog.popContentDiv.id, [{
    styler: new OSH.UI.Styler.Curve({
        valuesFunc: {
            dataSourceIds: [weatherDataSource.getId()],
            handler: function(rec, timeStamp) {
                return {
                    x: timeStamp,
                    y: parseFloat(rec[2])
                };
            }
        }
    })
}], {
    name: "WindSpeed chart",
    yLabel: 'Wind Speed (m/s)',
    xLabel: 'Time',
    css: "chart-view",
    cssSelected: "video-selected",
    maxPoints: 30
});
 */
OSH.UI.Nvd3LineChartView = OSH.UI.ChartView.extend({
	initialize : function(parentElementDivId,viewItems, options) {
		this._super(parentElementDivId,viewItems,options);

		this.entityId = options.entityId;
		this.xLabel = 'Time';
        this.yLabel = 'yAxisLabel';
		var xTickFormat = null;

		var yTickFormat = d3.format('.02f');
		var useInteractiveGuideline = true;
		var showLegend = true;
		var showYAxis = true;
		var showXAxis = true;
		var transitionDuration = 1;
        this.maxPoints = 999;

		if (!isUndefinedOrNull(options)) {
			if (options.xLabel) {
                this.xLabel = options.xLabel;
			}

			if (options.yLabel) {
                this.yLabel = options.yLabel;
			}

			if (options.xTickFormat) {
				xTickFormat = options.xTickFormat;
			}

			if (options.yTickFormat) {
				yTickFormat = options.yTickFormat;
			}

			if (options.showLegend) {
				showLegend = options.showLegend;
			}

			if (options.showXAxis) {
				showXAxis = options.showXAxis;
			}

			if (options.showYAxis) {
				showYAxis = options.showYAxis;
			}

			if (options.useInteractiveGuideline) {
				useInteractiveGuideline = options.useInteractiveGuideline;
			}

			if (options.transitionDuration) {
				transitionDuration = options.transitionDuration;
			}
			if (options.maxPoints) {
				this.maxPoints = options.maxPoints;
			}
		}

		this.chart = nv.models.lineChart().margin({
			left : 75,
			right : 25
		}) //Adjust chart margins to give the x-axis some breathing room.
		.options({
			duration : 1, // This should be duration: 300
			useInteractiveGuideline : useInteractiveGuideline
		}) //We want nice looking tooltips and a guideline!
		.duration(1)
		//.transitionDuration(1) //how fast do you want the lines to transition?
		.showLegend(showLegend) //Show the legend, allowing users to turn on/off line series.
		.showYAxis(showYAxis) //Show the y-axis
		.showXAxis(showXAxis) //Show the x-axis
		// .forceY([27.31,28])
		;

		this.chart.xAxis //Chart x-axis settings
		.axisLabel(this.xLabel).tickFormat(function(d) {
			return d3.time.format.utc('%H:%M:%SZ')(new Date(d));
		}).axisLabelDistance(5);

		this.chart.yAxis //Chart y-axis settings
		.axisLabel(this.yLabel).tickFormat(d3.format('.02f'))
		.axisLabelDistance(5);

		this.css = document.getElementById(this.divId).className;

		if(!isUndefinedOrNull(options)) {
			if (options.css) {
				this.css += " " + options.css;
			}

			if (options.cssSelected) {
				this.cssSelected = options.cssSelected;
			}
		}

		//create svg element
		var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');

		this.div = document.getElementById(this.divId);
		this.div.appendChild(svg);

		this.div.style.width = this.width;
		this.div.style.height = this.height;
		
		this.svgChart = d3.select('#' + this.divId + ' svg'); //Select the <svg> element you want to render the chart in.

		var self =this;

        /**
		 * entityId : styler.viewItem.entityId
         */

        this.chart.legend.margin().bottom = 25;
		if(!isUndefinedOrNull(options) && !isUndefinedOrNull(options.initData) && options.initData) {
            this.svgChart
                .datum([{
                    values : [{y : 0,x : 0}],
                    key : "",
                    interpolate : "cardinal",
                    area : true
                }]) //Populate the <svg> element with chart data...
                .call(this.chart);
		}
	},

	/**
	 *
	 * @param styler
	 * @param timestamp
	 * @param options
	 * @instance
	 * @memberof OSH.UI.Nvd3CurveChartView
	 */
	updateLinePlot : function(styler, timestamp, options) {
		if (typeof (this.data) === "undefined") {
			this.d3Data = [];	
			var name = options.name;

			this.data = {
				values : [],
				key : this.names[styler.getId()],
				interpolate : "cardinal",
				area : true,
				color:styler.color
			};

			this.data.values.push({
				y : styler.y,
				x : styler.x
			});

			this.svgChart
					.datum([this.data]) //Populate the <svg> element with chart data...
					.call(this.chart);

            OSH.EventManager.observeDiv(this.divId,"click",function(event){

                var dataSourcesIds = [];
                var entityId;
				OSH.EventManager.fire(OSH.EventManager.EVENT.SELECT_VIEW,{
					dataSourcesIds: styler.getDataSourcesIds(),
					entityId : styler.viewItem.entityId
				});
            });

		} else {
			this.data.color = styler.color;
			if(!isUndefinedOrNull(styler.viewItem.name)) {
				this.data.key  = styler.viewItem.name;
			}
			this.data.values.push({
				y : styler.y,
				x : styler.x
			});
		}

		this.chart.update();
		if (this.data.values.length > this.maxPoints) {
			this.data.values.shift();
		}
	},

	updateProperties:function(properties) {
		if(!isUndefined(properties)) {
			if(!isUndefinedOrNull(properties.xLabel)) {
				this.xLabel = properties.xLabel;
                this.chart.xAxis.axisLabel(this.xLabel);
			}

            if(!isUndefinedOrNull(properties.yLabel)) {
                this.yLabel = properties.yLabel;
                this.chart.yAxis.axisLabel(this.yLabel);
            }

            if(!isUndefinedOrNull(properties.maxPoints)) {
				this.maxPoints = properties.maxPoints;
            }
		}
	},

	/**
	 *
	 * @param dataSourceIds
	 * @instance
	 * @memberof OSH.UI.Nvd3CurveChartView
	 */
	selectDataView: function(dataSourceIds) {
		var currentDataSources= this.getDataSourcesId();
		if(OSH.Utils.isArrayIntersect(dataSourceIds,currentDataSources)) {
			this.div.setAttribute("class",this.css+" "+this.cssSelected);
		} else {
			this.div.setAttribute("class",this.css);
		}
	},

	removeLinePlot:function(styler) {
		//TODO: remove current styler
	},

	/**
     * @instance
     * @memberof OSH.UI.Nvd3CurveChartView
     */
    reset: function () {
        this.data.values = [];
        this.chart.update();
    }
});