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
 * // type
 * properties.icon.type = ""
 *
 * // DS
 * properties.icon.threshold.datasource = "";
 * properties.icon.threshold.observable = "";
 *
 * // default
 * properties.icon.threshold.default = "";
 *
 * // icon func
 * properties.icon.threshold.lowIcon = "";
 * properties.icon.threshold.highIcon = "";
 * properties.icon.threshold.value = "";
 * properties.icon.threshold.selectedIcon = "";
 *
 * //icon fixed
 * properties.icon.fixed.fixedIcon = "";
 */
OSH.UI.Styler.Factory.createMarkerStyler = function(properties) {
    // check icon
    var resultProperties = {};

    if(!isUndefinedOrNull(properties.icon)) {
        // check type
        if(!isUndefined(properties.icon.fixed)) {
           resultProperties.fixedIcon = { blob : properties.icon.fixed.blob};
           resultProperties.icon =  window.URL.createObjectURL(resultProperties.fixedIcon.blob);
        }

        if(!isUndefined(properties.icon.threshold)) {

        }
    }
    // creates styler instance from tabs properties
    return new OSH.UI.Styler.PointMarker(resultProperties);
};
