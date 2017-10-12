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
 *
 * @constructor
 */
OSH.UI.ViewFactory = function() {};

/**
 * This method provides a simple way to get default view properties
 * @instance
 * @memberof OSH.UI.ViewFactory
 * @param OSH.UI.ViewFactory.ViewInstanceType viewInstanceType the instance type of the view
 * @return the default properties to setup the view
 *
 */
OSH.UI.ViewFactory.getDefaultViewProperties = function(viewInstanceType){
    var props = {};

    switch (viewInstanceType) {
        case OSH.UI.ViewFactory.ViewInstanceType.LEAFLET : break;
        case OSH.UI.ViewFactory.ViewInstanceType.FFMPEG : {
            props = {
                css: "video",
                cssSelected: "video-selected",
                name: "Video",
                useWorker: true,
                useWebWorkerTransferableData: false,
                keepRatio:true
            };
            break;
        }
        case OSH.UI.ViewFactory.ViewInstanceType.MJPEG : {
            props = {
                css: "video",
                cssSelected: "video-selected",
                name: "Video",
                keepRatio:true
            };
            break;
        }
        case OSH.UI.ViewFactory.ViewInstanceType.NVD3_LINE_CHART : {
            props = {
                name: "Line chart",
                css: "chart-view",
                cssSelected: "",
                maxPoints: 30,
                initData:true
            };
            break;
        }
        default:break;
    }

    return props;
};

/**
 * Gets an instance of a view given its property and which does not contain any stylers
 * @param viewInstanceType
 * @param viewProperties
 * @param datasource
 * @param entity
 * @return {*}
 */
OSH.UI.ViewFactory.getDefaultSimpleViewInstance = function(viewInstanceType,viewProperties) {
    var cloneProperties = {};
    cloneProperties = OSH.Utils.clone(viewProperties);

    var viewInstance = null;

    switch (viewInstanceType) {
        case OSH.UI.ViewFactory.ViewInstanceType.FFMPEG : {
            viewInstance = new OSH.UI.FFMPEGView("",cloneProperties);
        }
        break;
        case OSH.UI.ViewFactory.ViewInstanceType.MJPEG : {
            viewInstance = new OSH.UI.MjpegView("",cloneProperties);
        }
            break;
        default:break;
    }

    viewInstance.id = viewProperties.id;
    viewInstance.viewInstanceType = viewInstanceType;

    return viewInstance;
};

OSH.UI.ViewFactory.getDefaultViewInstance = function(viewInstanceType, defaultProperties) {
    var viewInstance = null;

    switch (viewInstanceType) {
        case OSH.UI.ViewFactory.ViewInstanceType.FFMPEG : {
            viewInstance = new OSH.UI.FFMPEGView("",[],defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.LEAFLET : {
            viewInstance = new OSH.UI.LeafletView("",[],defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.CESIUM : {
            viewInstance = new OSH.UI.CesiumView("",[],defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.NVD3_LINE_CHART : {
            viewInstance = new OSH.UI.Nvd3LineChartView("",[],defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.FFMPEG : {
            viewInstance = new OSH.UI.FFMPEGView("",[],defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.MJPEG : {
            viewInstance = new OSH.UI.MjpegView("",[],defaultProperties);
        }
            break;
        default:
            break;
    }
    viewInstance.viewInstanceType = viewInstanceType;
    return viewInstance;
};

OSH.UI.ViewFactory.ViewInstanceType = {
    LEAFLET: "leaflet",
    FFMPEG:"video_h264",
    CESIUM: "cesium",
    MJPEG: "video_mjpeg",
    NVD3_LINE_CHART: "line_chart"
};