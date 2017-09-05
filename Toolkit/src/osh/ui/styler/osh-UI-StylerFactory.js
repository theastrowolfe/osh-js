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
OSH.UI.Styler.Factory = function() {};

OSH.UI.Styler.Factory.LOCATION_DEFINITIONS = ["http://www.opengis.net/def/property/OGC/0/SensorLocation","http://sensorml.com/ont/swe/property/Location"];
OSH.UI.Styler.Factory.ORIENTATION_DEFINITIONS = ["http://sensorml.com/ont/swe/property/OrientationQuaternion"];
OSH.UI.Styler.Factory.CURVE_DEFINITIONS = ["http://sensorml.com/ont/swe/property/Weather"];


/**
 *
 * @param properties
 * //-- LOCATION
 * properties.location.default.x -> Number
 * properties.location.default.y -> Number
 * properties.location.default.z -> Number
 * properties.location.mappingIdx.x -> Number (index into DS)
 * properties.location.mappingIdx.y -> Number (index into DS)
 * properties.location.mappingIdx.z -> Number (index into DS)
 *
 * //-- ICON
 * // DS
 * properties.icon.threshold.datasourceIdx -> Number;
 * properties.icon.threshold.observableIdx -> Number;
 *
 * // icon func
 * properties.icon.threshold.lowIcon -> Object -> {arraybuffer -> ArrayBuffer, name -> String, type -> String};
 * properties.icon.threshold.highIcon -> Object -> {arraybuffer -> ArrayBuffer, name -> String, type -> String};
 * properties.icon.threshold.value -> Number;
 * properties.icon.threshold.selectedIcon -> Object -> {arraybuffer -> ArrayBuffer, name -> String, type -> String};
 *
 * // icon fixed
 * properties.icon.fixed.defaultIcon -> Object -> {arraybuffer -> ArrayBuffer, name -> String, type -> String};
 * properties.icon.fixed.selectedIcon -> Object -> {arraybuffer -> ArrayBuffer, name -> String, type -> String};
 */

OSH.UI.Styler.Factory.createMarkerStylerProperties = function(properties) {
    var resultProperties = {};

    var datasources = properties.datasources;

    //-- LOCATION PART
    if(!isUndefinedOrNull(properties.location)) {

        resultProperties.location = {
            x:Number(properties.location.default.x),
            y:Number(properties.location.default.y),
            z:Number(properties.location.default.z)
        };

        if(!isUndefinedOrNull(properties.location.datasourceIdx)) {
            var ds = datasources[properties.location.datasourceIdx];
            var locationFnStr = "return {" +
                "x: rec." + ds.resultTemplate[properties.location.mappingIdx.x].path + "," +
                "y: rec." + ds.resultTemplate[properties.location.mappingIdx.y].path + "," +
                "z: rec." + ds.resultTemplate[properties.location.mappingIdx.z].path + "," +
                "}";

            var argsLocationTemplateHandlerFn = ['rec', locationFnStr];
            var locationTemplateHandlerFn = Function.apply(null, argsLocationTemplateHandlerFn);

            resultProperties.locationFunc = {
                dataSourceIds: [ds.id],
                handler: locationTemplateHandlerFn
            };
        }
    }

    //-- ICON PART
    if(!isUndefinedOrNull(properties.icon)) {
        // check type
        if(!isUndefinedOrNull(properties.icon.fixed)) {
            var defaultUrl;
            if(!isUndefinedOrNull(properties.icon.fixed.defaultIcon)) {
                defaultUrl = OSH.Utils.arrayBufferToImageDataURL(properties.icon.fixed.defaultIcon.arraybuffer);
                resultProperties.icon = defaultUrl;
            }

            if(!isUndefinedOrNull(properties.icon.fixed.selectedIcon) && !isUndefinedOrNull(properties.location.datasourceIdx)) {
                var ds = datasources[properties.location.datasourceIdx];
                var selectedBlobURL = OSH.Utils.arrayBufferToImageDataURL(properties.icon.fixed.selectedIcon.arraybuffer);

                iconTemplate = "if (options.selected) {";
                iconTemplate += "  return '" + selectedBlobURL + "'";
                iconTemplate += "} else {";
                iconTemplate += "  return '" + defaultUrl + "'";
                iconTemplate += "}";

                var argsIconTemplateHandlerFn = ['rec', 'timeStamp', 'options', iconTemplate];
                var iconTemplateHandlerFn = Function.apply(null, argsIconTemplateHandlerFn);

                resultProperties.iconFunc = {
                    dataSourceIds: [ds.id],
                    handler: iconTemplateHandlerFn
                };
            }
        }

        var iconTemplate = "";
        var blobURL = "";

        if(!isUndefinedOrNull(properties.icon.threshold) && !isUndefinedOrNull(properties.icon.threshold.datasourceIdx)) {
            var ds = datasources[properties.icon.threshold.datasourceIdx];

            var path = ds.resultTemplate[properties.icon.threshold.observableIdx].path;

            blobURL = OSH.Utils.arrayBufferToImageDataURL(properties.icon.threshold.lowIcon.arraybuffer);
            iconTemplate += "if (" + path + " < " + properties.icon.threshold.value + " ) { return '" + blobURL + "'; }";

            blobURL = OSH.Utils.arrayBufferToImageDataURL(properties.icon.threshold.highIcon.arraybuffer);
            iconTemplate += "else { return '" + blobURL + "'; }";

            var argsIconTemplateHandlerFn = ['rec', 'timeStamp' ,'options', iconTemplate];
            var iconTemplateHandlerFn = Function.apply(null, argsIconTemplateHandlerFn);

            resultProperties.iconFunc = {
                dataSourceIds: [ds.id],
                handler: iconTemplateHandlerFn
            };
        }
    }

    //TODO:check color
    //TODO:check size
    //TODO:check label

    // creates styler instance from tabs properties
    //return new OSH.UI.Styler.PointMarker(resultProperties);
    return resultProperties;
};
