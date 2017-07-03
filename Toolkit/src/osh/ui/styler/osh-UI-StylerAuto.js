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
 * @class OSH.UI.Styler.Auto
 * @type {OSH.UI.Styler}
 * @augments OSH.UI.Styler
 */
OSH.UI.Styler.Auto = OSH.UI.Styler.extend({
	initialize : function(properties) {
		this._super(properties);
		this.properties = properties;

		if(typeof(this.properties) !== "undefined" && typeof(this.properties.datasourceIds) !== "undefined") {
			/* try to detect the kind of data

			//-- LOCATION:
			{
				x: ..,
				y: ..,
				z: ..
            }
			// http://www.opengis.net/def/property/OGC/0/SensorLocation -> location
			// http://sensorml.com/ont/swe/property/Location --> location

			//-- ORIENTATION:
			{
			 heading : ..
			}
			// http://sensorml.com/ont/swe/property/OrientationQuaternion --> orientation

			//-- WEATHER:
			{
			  x: ..,
			  y: ..
			}
			// http://sensorml.com/ont/swe/property/Weather --> weather
			*/
		}
	}
});