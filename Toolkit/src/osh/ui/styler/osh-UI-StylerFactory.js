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

OSH.UI.Styler.Factory.TYPE = {
    MARKER:"Marker",
    POLYLINE:"Polyline",
    LINE_PLOT: "LinePlot",
    VIDEO: "Video"
};


OSH.UI.Styler.Factory.getLocation = function(x,y,z) {
  return {
      location: {
          x: x,
          y: y,
          z: z
      }
  };
};


//---- LOCATION ----//
OSH.UI.Styler.Factory.getLocationFunc = function(datasource,xIdx,yIdx,zIdx) {

    var x = "timeStamp",y = "timeStamp",z="timeStamp";

    if(xIdx > 0 ) {
        x = "rec." + datasource.resultTemplate[xIdx].path;
    }

    if(yIdx > 0 ) {
        y = "rec." + datasource.resultTemplate[yIdx].path;
    }

    if(zIdx > 0 ) {
        z = "rec." + datasource.resultTemplate[zIdx].path;
    }

    var locationFnStr = "return {" +
        "x: "+ x + "," +
        "y: "+ y + "," +
        "z: "+ z +
        "}";

    var argsLocationTemplateHandlerFn = ['rec','timeStamp','options', locationFnStr];
    var locationTemplateHandlerFn = Function.apply(null, argsLocationTemplateHandlerFn);

    return {
        locationFunc : {
            dataSourceIds: [datasource.id],
            handler: locationTemplateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getCustomLocationFunc = function(styler,locationFnStr) {
    OSH.Asserts.checkObjectPropertyPath(styler,
        "properties.locationFunc.dataSourceIds","The styler must have datasourceId to be used with locationFunc");

    var argsLocationTemplateHandlerFn = ['rec', locationFnStr];
    var locationTemplateHandlerFn = Function.apply(null, argsLocationTemplateHandlerFn);

    return {
        locationFunc : {
            dataSourceIds: styler.properties.locationFunc.dataSourceIds,
            handler: locationTemplateHandlerFn
        }
    };
};

//----- ICON ----//
OSH.UI.Styler.Factory.getFixedIcon = function(dataSourceIdsArray,url) {

    var iconTemplate =  "return '"+url+ "';";

    var argsIconTemplateHandlerFn = ['rec', 'timeStamp', 'options', iconTemplate];
    var iconTemplateHandlerFn = Function.apply(null, argsIconTemplateHandlerFn);

    // generates iconFunc in case of iconFunc was already set. This is to override existing function if no selected
    // icon has been set
    return  {
        icon: url,
        iconFunc : {
        dataSourceIds: dataSourceIdsArray, // TODO: find a way to use something else because it is not depending on datasources but user interaction in that case
            handler: iconTemplateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getThresholdIcon = function(datasource, observableIdx,
                                      defaultIconUrl, lowIconUrl, highIconUrl, thresholdValue) {

    OSH.Asserts.checkObjectPropertyPath(datasource,"resultTemplate", "The data source must contain the resultTemplate property");
    OSH.Asserts.checkArrayIndex(datasource.resultTemplate, observableIdx);
    OSH.Asserts.checkIsDefineOrNotNull(datasource);
    OSH.Asserts.checkIsDefineOrNotNull(defaultIconUrl);
    OSH.Asserts.checkIsDefineOrNotNull(lowIconUrl);
    OSH.Asserts.checkIsDefineOrNotNull(highIconUrl);
    OSH.Asserts.checkIsDefineOrNotNull(thresholdValue);

    var path = "timeStamp";

    if(observableIdx > 0) {
        path = "rec."+datasource.resultTemplate[observableIdx].path;
    }

    var iconTemplate = "if (" + path + " < " + thresholdValue + " ) { return '" + lowIconUrl + "'; }" + // <
                       "else if (" + path + " > " + thresholdValue + " ) { return '" + highIconUrl + "'; }" + // >
                       "else { return '"+defaultIconUrl+ "'; }"; // ==

    var argsIconTemplateHandlerFn = ['rec', 'timeStamp', 'options', iconTemplate];
    var iconTemplateHandlerFn = Function.apply(null, argsIconTemplateHandlerFn);

    return {
        icon: defaultIconUrl,
        iconFunc : {
            dataSourceIds: [datasource.id],
            handler: iconTemplateHandlerFn
        }
    };

};

OSH.UI.Styler.Factory.getCustomIconFunc = function(dataSourceIdsArray,iconFnStr) {
    var argsTemplateHandlerFn = ['rec', 'timeStamp', 'options', iconFnStr];
    var templateHandlerFn = Function.apply(null, argsTemplateHandlerFn);

    return {
        iconFunc : {
            dataSourceIds: dataSourceIdsArray,
            handler: templateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getSelectedIconFunc = function(dataSourceIdsArray,defaultUrl,selectedUrl) {

    OSH.Asserts.checkIsDefineOrNotNull(dataSourceIdsArray);
    OSH.Asserts.checkIsDefineOrNotNull(defaultUrl);
    OSH.Asserts.checkIsDefineOrNotNull(selectedUrl);

    var iconTemplate = "";
    var blobURL = "";

    iconTemplate = "if (options.selected) {";
    iconTemplate += "  return '" +  selectedUrl + "'";
    iconTemplate += "} else {";
    iconTemplate += "  return '" + defaultUrl + "'";
    iconTemplate += "}";

    var argsIconTemplateHandlerFn = ['rec', 'timeStamp', 'options', iconTemplate];
    var iconTemplateHandlerFn = Function.apply(null, argsIconTemplateHandlerFn);

    return {
        icon:defaultUrl,
        iconFunc : {
            dataSourceIds: dataSourceIdsArray,
            handler: iconTemplateHandlerFn
        }
    };
};

//---- VALUES ----//
OSH.UI.Styler.Factory.getValues = function(x,y) {
    return {
        values: {
            x: x,
            y: y
        }
    };
};

OSH.UI.Styler.Factory.getValuesFunc = function(datasource,xIdx,yIdx) {

    var x = "timeStamp",y = "timeStamp";

    if(xIdx > 0 ) {
        x = "rec." + datasource.resultTemplate[xIdx].path;
    }

    if(yIdx > 0 ) {
        y = "rec." + datasource.resultTemplate[yIdx].path;
    }

    var valuesFnStr = "return {" +
        "x: "+ x + "," +
        "y: "+ y +
        "}";

    var argsValuesTemplateHandlerFn = ['rec', 'timeStamp', 'options', valuesFnStr];
    var valuesTemplateHandlerFn = Function.apply(null, argsValuesTemplateHandlerFn);

    return {
        valuesFunc : {
            dataSourceIds: [datasource.id],
            handler: valuesTemplateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getCustomValuesFunc = function(dataSourceIdsArray,valuesFnStr) {
    var argsTemplateHandlerFn = ['rec', 'timeStamp', 'options', valuesFnStr];
    var templateHandlerFn = Function.apply(null, argsTemplateHandlerFn);

    return {
        valuesFunc : {
            dataSourceIds: dataSourceIdsArray,
            handler: templateHandlerFn
        }
    };
};

// COLOR
OSH.UI.Styler.Factory.getFixedColor = function(dataSourceIdsArray,url) {

    var colorTemplate =  "return '"+url+ "';";

    var argsColorTemplateHandlerFn = ['rec', 'timeStamp', 'options', colorTemplate];
    var colorTemplateHandlerFn = Function.apply(null, argsColorTemplateHandlerFn);

    // generates iconFunc in case of iconFunc was already set. This is to override existing function if no selected
    // icon has been set
    return  {
        color: url,
        colorFunc : {
            dataSourceIds: dataSourceIdsArray, // TODO: find a way to use something else because it is not depending on datasources but user interaction in that case
            handler: colorTemplateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getThresholdColor = function(datasource, observableIdx,
                                                  defaultColor, lowColor, highColor, thresholdValue) {

    OSH.Asserts.checkObjectPropertyPath(datasource,"resultTemplate", "The data source must contain the resultTemplate property");
    OSH.Asserts.checkArrayIndex(datasource.resultTemplate, observableIdx);
    OSH.Asserts.checkIsDefineOrNotNull(datasource);
    OSH.Asserts.checkIsDefineOrNotNull(defaultColor);
    OSH.Asserts.checkIsDefineOrNotNull(lowColor);
    OSH.Asserts.checkIsDefineOrNotNull(highColor);
    OSH.Asserts.checkIsDefineOrNotNull(thresholdValue);

    var path = "timeStamp";

    if(observableIdx > 0) {
        path = "rec."+datasource.resultTemplate[observableIdx].path;
    }

    var colorTemplate = "if (" + path + " < " + thresholdValue + " ) { return '" + lowColor + "'; }" + // <
        "else if (" + path + " > " + thresholdValue + " ) { return '" + highColor + "'; }" + // >
        "else { return '"+defaultColor+ "'; }"; // ==

    var argsColorTemplateHandlerFn = ['rec', 'timeStamp', 'options', colorTemplate];
    var colorTemplateHandlerFn = Function.apply(null, argsColorTemplateHandlerFn);

    return {
        color: defaultColor,
        colorFunc : {
            dataSourceIds: [datasource.id],
            handler: colorTemplateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getCustomColorFunc = function(dataSourceIdsArray,colorFnStr) {
    var argsTemplateHandlerFn = ['rec', 'timeStamp', 'options', colorFnStr];
    var templateHandlerFn = Function.apply(null, argsTemplateHandlerFn);

    return {
        colorFunc : {
            dataSourceIds: dataSourceIdsArray,
            handler: templateHandlerFn
        }
    };
};

OSH.UI.Styler.Factory.getSelectedColorFunc = function(dataSourceIdsArray,defaultColor,selectedColor) {

    OSH.Asserts.checkIsDefineOrNotNull(dataSourceIdsArray);
    OSH.Asserts.checkIsDefineOrNotNull(defaultColor);
    OSH.Asserts.checkIsDefineOrNotNull(selectedColor);

    var colorTemplate = "";
    var blobURL = "";

    colorTemplate = "if (options.selected) {";
    colorTemplate += "  return '" +  selectedColor + "'";
    colorTemplate += "} else {";
    colorTemplate += "  return '" + defaultColor + "'";
    colorTemplate += "}";

    var argsColorTemplateHandlerFn = ['rec', 'timeStamp', 'options', colorTemplate];
    var colorTemplateHandlerFn = Function.apply(null, argsColorTemplateHandlerFn);

    return {
        color:defaultColor,
        colorFunc : {
            dataSourceIds: dataSourceIdsArray,
            handler: colorTemplateHandlerFn
        }
    };
};

// VIDEO
OSH.UI.Styler.Factory.getVideoFunc = function(datasource, observableIdx) {

    OSH.Asserts.checkObjectPropertyPath(datasource,"resultTemplate", "The data source must contain the resultTemplate property");
    OSH.Asserts.checkArrayIndex(datasource.resultTemplate, observableIdx);
    OSH.Asserts.checkIsDefineOrNotNull(datasource);

    var videoTemplate = "return rec"; // ==

    var argsVideoTemplateHandlerFn = ['rec', 'timeStamp', 'options', videoTemplate];
    var videoTemplateHandlerFn = Function.apply(null, argsVideoTemplateHandlerFn);

    return {
        frameFunc : {
            dataSourceIds: [datasource.id],
            handler: videoTemplateHandlerFn
        }
    };

};


OSH.UI.Styler.Factory.getTypeFromInstance = function(stylerInstance) {
    if(stylerInstance instanceof OSH.UI.Styler.PointMarker){
        return OSH.UI.Styler.Factory.TYPE.MARKER;
    } else if(stylerInstance instanceof OSH.UI.Styler.Polyline){
        return OSH.UI.Styler.Factory.TYPE.POLYLINE;
    } else if(stylerInstance instanceof OSH.UI.Styler.LinePlot){
        return OSH.UI.Styler.Factory.TYPE.LINE_PLOT;
    } else if(stylerInstance instanceof OSH.UI.Styler.Video){
        return OSH.UI.Styler.Factory.TYPE.VIDEO;
    } else {
        throw new OSH.Exception.Exception("No type available for the instance "+stylerInstance);
    }
};

OSH.UI.Styler.Factory.getNewInstanceFromType = function(type) {
    if(type === OSH.UI.Styler.Factory.TYPE.LINE_PLOT) {
        return new OSH.UI.Styler.LinePlot({});
    } else if(type === OSH.UI.Styler.Factory.TYPE.MARKER) {
        return new OSH.UI.Styler.PointMarker({});
    } else if(type === OSH.UI.Styler.Factory.TYPE.POLYLINE) {
        return new OSH.UI.Styler.Polyline({});
    } else if(type === OSH.UI.Styler.Factory.TYPE.VIDEO) {
        return new OSH.UI.Styler.Video({});
    } else {
        throw new OSH.Exception.Exception("No styler instance available for the type "+type);
    }
};


OSH.UI.Styler.Factory.buildFunctionFromSource = function(dataSourceIds,propertyName,strSource) {
    var stylerFunc = {};

    var argsFuncTemplateHandlerFn = ['rec', 'timeStamp', 'options', strSource];
    var funcTemplateHandlerFn = Function.apply(null, argsFuncTemplateHandlerFn);

    stylerFunc[propertyName] = {
        dataSourceIds: dataSourceIds,
        handler: funcTemplateHandlerFn
    };

    return stylerFunc;
};
