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
 * properties.icon.threshold.datasource -> String;
 * properties.icon.threshold.observableIdx -> Number;
 *
 * // default
 * properties.icon.threshold.defaultIcon -> Object -> {blob -> Blob object};
 *
 * // icon func
 * properties.icon.threshold.lowIcon -> Object -> {blob -> Blob object};
 * properties.icon.threshold.highIcon -> Object -> {blob -> Blob object};
 * properties.icon.threshold.value -> Number;
 * properties.icon.threshold.selectedIcon -> Object -> {blob -> Blob object};
 *
 * //icon fixed
 * properties.icon.fixed.fixedIcon -> Object -> {blob -> Blob object};
 */

OSH.UI.Styler.Factory.createMarkerStylerProperties = function(properties) {
    var resultProperties = {};

    //-- LOCATION PART
    if(!isUndefinedOrNull(properties.location)) {

        resultProperties.location = {
            x:properties.location.default.x,
            y:properties.location.default.y,
            z:properties.location.default.z
        };

        if(!isUndefinedOrNull(properties.location.datasource)) {
            var locationFnStr = "return {" +
                "x: rec." + properties.location.datasource.resultTemplate[properties.location.mappingIdx.x].path + "," +
                "y: rec." + properties.location.datasource.resultTemplate[properties.location.mappingIdx.y].path + "," +
                "z: rec." + properties.location.datasource.resultTemplate[properties.location.mappingIdx.z].path + "," +
                "}";

            var argsLocationTemplateHandlerFn = ['rec', locationFnStr];
            var locationTemplateHandlerFn = Function.apply(null, argsLocationTemplateHandlerFn);

            resultProperties.locationFunc = {
                dataSourceIds: [properties.location.datasource.id],
                handler: locationTemplateHandlerFn
            };
        }
    }


    //-- ICON PART
    if(!isUndefinedOrNull(properties.icon)) {
        // check type
        if(!isUndefined(properties.icon.fixed)) {
           resultProperties.fixedIcon = { blob : properties.icon.fixed.blob};
           resultProperties.icon =  window.URL.createObjectURL(resultProperties.fixedIcon.blob);
        }

        if(!isUndefined(properties.icon.threshold)) {
            var iconTemplate = "";
            if(!isUndefinedOrNull(properties.icon.selectedIcon)){
                iconTemplate = "if (options.selected) {";
                iconTemplate +="  return '"+properties.icon.threshold.selectedIcon.blob+"'";
                iconTemplate +="} else {";
                iconTemplate +="  return '"+properties.icon.threshold.defaultIcon.blob+"'";
                iconTemplate +="}";
            }

            var path = properties.icon.threshold.datasource.resultTemplate[properties.icon.threshold.observableIdx].path;

            iconTemplate += "if ("+path+" < "+ properties.icon.threshold.value+" ) { return '"+window.URL.createObjectURL(properties.icon.threshold.lowIcon.blob)+"'; }";
            iconTemplate += "else { return '"+window.URL.createObjectURL(properties.icon.threshold.highIcon.blob)+"'; }";

            var iconTemplateHandlerFn = new Function('iconHandlerFn',iconTemplate);

            resultProperties.iconFunc = {
                dataSourceIds:[properties.icon.threshold.datasource.id],
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
