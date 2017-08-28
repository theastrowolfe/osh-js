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
        case OSH.UI.ViewFactory.ViewInstanceType.VIDEO_H264 : {
            props = {
                css: "video",
                cssSelected: "video-selected",
                name: "Video",
                useWorker: true,
                useWebWorkerTransferableData: false
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
OSH.UI.ViewFactory.getDefaultSimpleViewInstance = function(viewInstanceType,viewProperties, datasource, entity) {
    var cloneProperties = {};
    cloneProperties = OSH.Utils.clone(viewProperties);

    cloneProperties.dataSourceId = datasource.id;

    if(!isUndefinedOrNull(entity)) {
        cloneProperties.entityId = entity.id;
    }

    var viewInstance = null;

    switch (viewInstanceType) {
        case OSH.UI.ViewFactory.ViewInstanceType.VIDEO_H264 : {
            viewInstance = new OSH.UI.FFMPEGView("",cloneProperties);
        }
        break;
        default:break;
    }

    return viewInstance;
};

OSH.UI.ViewFactory.getDefaultViewInstance = function(viewInstanceType, defaultProperties, viewItems) {
    var viewInstance = null;

    switch (viewInstanceType) {
        case OSH.UI.ViewFactory.ViewInstanceType.VIDEO_H264 : {

        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.LEAFLET : {
            viewInstance = new OSH.UI.LeafletView("",viewItems,defaultProperties);
        }
            break;
        case OSH.UI.ViewFactory.ViewInstanceType.CESIUM : {
            viewInstance = new OSH.UI.CesiumView("",viewItems,defaultProperties);
        }
            break;

        default:
            break;
    }
    return viewInstance;
};

OSH.UI.ViewFactory.ViewInstanceType = {
    LEAFLET: "leaflet",
    VIDEO_H264:"video_h264",
    CESIUM: "cesium"
};