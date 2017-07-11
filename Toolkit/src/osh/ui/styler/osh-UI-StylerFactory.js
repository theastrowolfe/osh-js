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
 * @returns {object}
 * @instance
 * @memberof OSH.UI.Styler.Factory
 */
OSH.UI.Styler.Factory.createStyler = function(datasourceArrIds,callback) {
	var server = null;

	var nbDs = 0;
	var styler = null;

	var callServer = function(dataSource, properties) {
        server = new OSH.Server({
            url: "http://" + dataSource.properties.endpointUrl
        });

        // offering, observedProperty
        server.getResultTemplate(dataSource.properties.offeringID,dataSource.properties.observedProperty, function(jsonResp){
            // do something
            // http://www.opengis.net/def/property/OGC/0/SensorLocation -> location
            // http://sensorml.com/ont/swe/property/Location --> location


			if(++nbDs < datasourceArrIds.length) {
                callServer(datasourceArrIds[nbDs], properties);
            } else {
				callback(styler);
			}
        },function(error) {
            // do something
        });
	};

	if(datasourceArrIds.length > 0) {
        callServer(datasourceArrIds[0], {});
    }
};

OSH.UI.Styler.Factory.getDatasourceProperties = function(datasource,callback) {
	var server = new OSH.Server({
		url: "http://" + datasource.properties.endpointUrl
	});

    // offering, observedProperty
    server.getResultTemplate(datasource.properties.offeringID,datasource.properties.observedProperty, function(jsonResp){
		callback(jsonResp);
    },function(error) {
        // do something
		callback();
    });
};

OSH.UI.Styler.Factory.getDatasourcesProperties = function(datasources,callback) {
    var callServer = function(dataSource, propertiesMap,nbDs) {
        OSH.UI.Styler.Factory.getDatasourceProperties(dataSource,function(jsonResp){
			if(typeof(jsonResp) !== "undefined") {
                propertiesMap[dataSource] = jsonResp;
			}

            if(nbDs+1 < datasources.length) {
                callServer(datasources[nbDs+1], propertiesMap,nbDs+1);
            } else {
                callback(propertiesMap);
            }
        });
    };

    if(datasources.length > 0) {
        callServer(datasources[0], [],0);
    }
};

OSH.UI.Styler.Factory.createMarkerStyler = function(datasources,callback) {

	OSH.UI.Styler.Factory.getDatasourcesProperties(datasources,function(propertiesMap) {
		var resultStylerProperties = {};
		for(var i=0;i< datasources.length;i++) {
			var currentDS = datasources[i];
			var dsResultTemplateProperties = propertiesMap[currentDS];

            OSH.Utils.copyProperties(OSH.UI.Styler.Factory.checkLocation(currentDS,dsResultTemplateProperties),resultStylerProperties);
            OSH.Utils.copyProperties(OSH.UI.Styler.Factory.checkOrientation(currentDS,dsResultTemplateProperties),resultStylerProperties);

		}

        callback(new OSH.UI.Styler.PointMarker(resultStylerProperties));
	});
};

OSH.UI.Styler.Factory.checkLocation = function(datasource, resultTemplateProperties) {
	var properties = {};

    if(OSH.UI.Styler.Factory.LOCATION_DEFINITIONS.indexOf(datasource.properties.observedProperty) > -1) {
        // is location
        var location = { //TODO: get default values from server properties if any
            x : 0,
            y: 0,
            z: 0
        };


        var locationFunc =  {
            dataSourceIds: [datasource.id],
            handler: function (rec) {
                return {
                    x: rec.location.lon,
                    y: rec.location.lat,
                    z: rec.location.alt
                };
            }
        };

        var icon = 'images/cameralook.png';

        properties.location = location;
        properties.locationFunc = locationFunc;
        properties.icon = icon;
    }

    return properties;
};

OSH.UI.Styler.Factory.checkOrientation = function(datasource, resultTemplateProperties) {
    var properties = {};

    if(OSH.UI.Styler.Factory.ORIENTATION_DEFINITIONS.indexOf(datasource.properties.observedProperty) > -1) {
        // is orientation
        var orentiation = {  //TODO: get default values from server properties if any
            heading : 0
        };

        var orientationFunc = {
            dataSourceIds: [datasource.id],
            handler: function (rec) {
                var qx = rec.orient.qx;
                var qy = rec.orient.qy;
                var qz = rec.orient.qz;
                var qw = rec.orient.q0;

                // look dir vector
                var x = 0;
                var y = 0;
                var z = -1;

                // calculate quat * vector
                var ix = qw * x + qy * z - qz * y;
                var iy = qw * y + qz * x - qx * z;
                var iz = qw * z + qx * y - qy * x;
                var iw = -qx * x - qy * y - qz * z;

                // calculate result * inverse quat
                var xp = ix * qw + iw * -qx + iy * -qz - iz * -qy;
                var yp = iy * qw + iw * -qy + iz * -qx - ix * -qz;
                var zp = iz * qw + iw * -qz + ix * -qy - iy * -qx;

                var yaw = 90 - (180 / Math.PI * Math.atan2(yp, xp));

                return {
                    heading: yaw
                };
            }
        };

        properties[orentiation] = orentiation;
        properties[orientationFunc] = orientationFunc;
    }

    return properties;
};


OSH.UI.Styler.Factory.createPolylineStyler = function(datasources,callback) {

};

OSH.UI.Styler.Factory.createCurveStyler = function(datasources,callback) {

};

OSH.UI.Styler.Factory.createNexradStyler = function(datasources,callback) {

};
