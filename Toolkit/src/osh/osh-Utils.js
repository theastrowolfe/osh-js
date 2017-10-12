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

var MAX_LONG = Math.pow(2, 53) + 1;

/**
 *
 * @constructor
 */
OSH.Utils = function() {};

/**
 *
 * @returns {string}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.randomUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

/**
 * This function stamps/embeds a UUID into an object and returns the UUID generated for it
 * @returns {string}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.stampUUID = function(obj) {
  obj._osh_id = obj._osh_id || OSH.Utils.randomUUID();
  return obj._osh_id;
};

/**
 *
 * @param xmlStr
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.jsonix_XML2JSON = function (xmlStr) {
  var module = SOS_2_0_Module_Factory();
  var context = new Jsonix.Context([XLink_1_0, IC_2_0, SMIL_2_0, SMIL_2_0_Language, GML_3_1_1, SWE_1_0_1, GML_3_2_1, OWS_1_1_0, SWE_2_0, SWES_2_0, WSN_T_1, WS_Addr_1_0_Core, OM_2_0, ISO19139_GMD_20070417, ISO19139_GCO_20070417, ISO19139_GSS_20070417, ISO19139_GTS_20070417, ISO19139_GSR_20070417, Filter_2_0, SensorML_2_0, SOS_2_0]);
  var unmarshaller = context.createUnmarshaller();
  var jsonData = unmarshaller.unmarshalString(xmlStr);
  return jsonData;
};


OSH.Utils.jsonix_JSON2XML = function (jsonStr) {
    var module = SOS_2_0_Module_Factory();
    var context = new Jsonix.Context([XLink_1_0, IC_2_0, SMIL_2_0, SMIL_2_0_Language, GML_3_1_1, SWE_1_0_1, GML_3_2_1, OWS_1_1_0, SWE_2_0, SWES_2_0, WSN_T_1, WS_Addr_1_0_Core, OM_2_0, ISO19139_GMD_20070417, ISO19139_GCO_20070417, ISO19139_GSS_20070417, ISO19139_GTS_20070417, ISO19139_GSR_20070417, Filter_2_0, SensorML_2_0, SOS_2_0]);
    var marshaller = context.createMarshaller();
    var xmlData = marshaller.marshalString(jsonStr);
    return xmlData;
};

//buffer is an ArrayBuffer object, the offset if specified in bytes, and the type is a string
//corresponding to an OGC data type.
//See http://def.seegrid.csiro.au/sissvoc/ogc-def/resource?uri=http://www.opengis.net/def/dataType/OGC/0/
/**
 *
 * @param buffer
 * @param offset
 * @param type
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.ParseBytes = function (buffer, offset, type) {
  var view = new DataView(buffer);

  //Note: There exist types not listed in the map below that have OGC definitions, but no appropriate
  //methods or corresponding types available for parsing in javascript. They are float128, float16, signedLong,
  //and unsignedLong
  var typeMap = {
    double: function (offset) {
      return {val: view.getFloat64(offset), bytes: 8};
    },
    float64: function (offset) {
      return {val: view.getFloat64(offset), bytes: 8};
    },
    float32: function (offset) {
      return {val: view.getFloat32(offset), bytes: 4};
    },
    signedByte: function (offset) {
      return {val: view.getInt8(offset), bytes: 1};
    },
    signedInt: function (offset) {
      return {val: view.getInt32(offset), bytes: 4};
    },
    signedShort: function (offset) {
      return {val: view.getInt16(offset), bytes: 2};
    },
    unsignedByte: function (offset) {
      return {val: view.getUint8(offset), bytes: 1};
    },
    unsignedInt: function (offset) {
      return {val: view.getUint32(offset), bytes: 4};
    },
    unsignedShort: function (offset) {
      return {val: view.getUint16(offset), bytes: 2};
    },
    //TODO: string-utf-8:
  };
  return typeMap[type](offset);
};

//This function recursivley iterates over the resultStructure to fill in
//values read from data which should be an ArrayBuffer containing the payload from a websocket
/**
 *
 * @param struct
 * @param data
 * @param offsetBytes
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.ReadData = function(struct, data, offsetBytes) {
  var offset = offsetBytes;
  for(var i = 0 ; i < struct.fields.length; i++) {
    var currFieldStruct = struct.fields[i];
    if(typeof currFieldStruct.type != 'undefined' && currFieldStruct.type !== null) {
      var ret = OSH.Utils.ParseBytes(data, offset, currFieldStruct.type);
      currFieldStruct.val = ret.val;
      offset += ret.bytes;
    } else if(typeof currFieldStruct.count != 'undefined' && currFieldStruct.count !== null) {
      //check if count is a reference to another variable
      if(isNaN(currFieldStruct.count))
      {
        var id = currFieldStruct.count;
        var fieldName = struct.id2FieldMap[id];
        currFieldStruct.count = struct.findFieldByName(fieldName).val;
      }
      for(var c = 0; c < currFieldStruct.count; c++) {
        for(var j = 0 ; j < currFieldStruct.fields.length; j++) {
          var field = JSON.parse(JSON.stringify(currFieldStruct.fields[j]));
          offset = OSH.Utils.ReadData(field, data, offset);
          currFieldStruct.val.push(field);
        }
      }
    }
  }
  return offset;
};

/**
 *
 * @param resultStructure
 * @returns {{}}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.GetResultObject = function(resultStructure) {
  //TODO: handle cases for nested arrays / matrix data types
  var result = {};
  for(var i = 0; i < resultStructure.fields.length; i++) {
    if(typeof resultStructure.fields[i].count != 'undefined') {
      result[resultStructure.fields[i].name] = [];
      for(var c = 0; c < resultStructure.fields[i].count; c++) {
        var item = {};
        for(var k = 0; k < resultStructure.fields[i].val[c].fields.length; k++) {
          item[resultStructure.fields[i].val[c].fields[k].name] = resultStructure.fields[i].val[c].fields[k].val;
        }
        result[resultStructure.fields[i].name].push(item);
      }
    } else {
      result[resultStructure.fields[i].name] = resultStructure.fields[i].val;
    }
  }
  return result;
};

/**
 *
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isOpera = function () {
  return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
};

/**
 *
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isFirefox = function() {
  return typeof InstallTrigger !== 'undefined';
};

/**
 *
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isSafari = function() {
  return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
};

/**
 *
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isIE = function() {
  return /*@cc_on!@*/false || !!document.documentMode;
};

/**
 *
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isChrome = function() {
  return !!window.chrome && !!window.chrome.webstore;
};

/**
 *
 * @returns {*|boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isBlink = function() {
  return (isChrome || isOpera) && !!window.CSS;
};

//------- GET X,Y absolute cursor position ---//
var absoluteXposition = null;
var absoluteYposition = null;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

function onMouseUpdate(e) {
  absoluteXposition = e.pageX;
  absoluteYposition = e.pageY;
}

/**
 *
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.getXCursorPosition = function() {
  return absoluteXposition;
};

/**
 *
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.getYCursorPosition = function() {
  return absoluteYposition;
};

/**
 *
 * @param a
 * @param b
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isArrayIntersect = function(a, b) {
  return a.filter(function(element){
        return b.indexOf(element) > -1;
       }).length > 0;
};


/**
 *
 * @param o
 * @returns {boolean}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isElement = function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
};

/**
 *
 * @returns {*}
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.isWebWorker = function() {
  if (typeof(Worker) !== "undefined") {
      return true;
  }
  return false;
};

/**
 *
 * @param div
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.takeScreeshot = function(div) {
};

/**
 * Remove a css class from a the div given as argument.
 * @param div the div to remove the class from
 * @param css the css class to remove
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.removeCss = function(div,css) {
  var divCss = div.className;
  css = divCss.replace(css,"");
  div.className = css;
};

/**
 * Check if a div element contains some css class
 * @param div the div element
 * @param className the className to search
 * @return {boolean}
 */
OSH.Utils.containsCss = function(div, className) {
    return div.className.indexOf(className) > -1;
};

/**
 * Replace a css class from a the div given as argument.
 * @param div the div to replace the class from
 * @param css the css class to replace
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.replaceCss = function(div,oldCss,newCss) {
    css = div.className.replace(oldCss,newCss);
    div.className = css;
};

/**
 * Add a css class to a the div given as argument.
 * @param div the div to add the class to
 * @param css the css class to add
 * @instance
 * @memberof OSH.Utils
 */
OSH.Utils.addCss = function(div,css) {
  div.setAttribute("class",div.className+" "+css);
};

OSH.Utils.removeLastCharIfExist = function(value,char) {
  if(typeof value === undefined || value === null || value.length === 0 || !value.endsWith("/")) {
    return value;
  }

  return value.substring(0,value.length-1);
};

/**
 * Merge properties from an object to another one.
 * If the property already exists, the function will try to copy children ones.
 *
 * @param from the origin object
 * @param to the object to copy properties into
 * @return {*} the final merged object
 */
OSH.Utils.copyProperties = function(from,to,forceMerge) {
    for (var property in from) {
        if(isUndefinedOrNull(to[property])  || forceMerge || OSH.Utils.isFunction(from[property]) || Array.isArray(from[property])) {
            to[property] = from[property];
        } else {
            // copy children
            if(OSH.Utils.isObject(from[property])) { // test is object
                OSH.Utils.copyProperties(from[property], to[property]);
            }
        }
    }
    return to;
};

OSH.Utils.isFunction = function(object) {
    return object === 'function' || object instanceof Function;
};

OSH.Utils.isObject = function(object) {
    return object === 'object' || object instanceof Object;
};

OSH.Utils.traverse = function(o,func,params) {
    for (var i in o) {
        func.apply(this,[i,o[i],params]);
        if (o[i] !== null && typeof(o[i])==="object") {
            //going one step down in the object tree!!
            params.level = params.level + 1;
            OSH.Utils.traverse(o[i],func,params);
            params.level = params.level - 1;
        }
    }
};

OSH.Utils.clone = function(o) {
    // From clone lib: https://github.com/pvorb/clone
    return clone(o);
};

OSH.Utils.getUOM = function(uomObject) {
    var result;

    var codeMap = {
        "Cel": "&#x2103;",
        "deg": "&#176;"
    };

    if(!isUndefinedOrNull(uomObject) && !isUndefinedOrNull(uomObject.code)) {
        var code =  uomObject.code;

        // check code list
        // https://www.w3schools.com/charsets/ref_utf_letterlike.asp => symbol list
        if(!isUndefinedOrNull(codeMap[uomObject.code])) {
            code = codeMap[uomObject.code];
        }
        result = code;
    }
    return result;
};

OSH.Utils.arrayBufferToImageDataURL = function(arraybuffer) {
    var blob = new Blob([new Uint8Array(arraybuffer)]);
    return URL.createObjectURL(blob);
};

OSH.Utils.getArrayBufferFromHttpImage = function(url,type,callback) {
    var xhr = new XMLHttpRequest();

    xhr.open( "GET", url, true );

    // Ask for the result as an ArrayBuffer.
    xhr.responseType = "arraybuffer";

    xhr.onload = function( e ) {
        callback(new Uint8Array( this.response ));
    };

    xhr.send();
};

OSH.Utils.createJSEditor = function(parentElt,content) {
    return OSH.Helper.HtmlHelper.addHTMLTextArea(parentElt, js_beautify(content));
};

OSH.Utils.hasOwnNestedProperty = function(obj,propertyPath){
    if(!propertyPath)
        return false;

    var properties = propertyPath.split('.');

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];

        if(!obj || !obj.hasOwnProperty(prop)){
            return false;
        } else {
            obj = obj[prop];
        }
    }

    return true;
};


OSH.Utils.createXDomainRequest = function() {
    var xdr = null;

    if (window.XDomainRequest) {
        xdr = new XDomainRequest();
    } else if (window.XMLHttpRequest) {
        xdr = new XMLHttpRequest();
    } else {
        throw new OSH.Exception.Exception("The browser does not handle cross-domain");
    }

    return xdr;
};

OSH.Utils.checkUrlImage = function(url,callback) {
    /*var xdr = OSH.Utils.createXDomainRequest();
    xdr.onload = function() {
        var contentType = xdr.getResponseHeader('Content-Type');
        if (contentType.slice(0,6) === 'image/') {// URL is valid image
            callback(true,{type: contentType});
        } else {
            callback(false);
        }
    }

    xdr.open("GET", url);
    xdr.send();*/
    callback(url.match(/\.(jpeg|jpg|gif|png)$/i) != null, {
        remote:(url.startsWith("http") || url.startsWith("https"))
    });
};


OSH.Utils.circularJSONStringify = function(object) {
    // From https://github.com/WebReflection/circular-json (credits)
    var CircularJSON=function(e,t){function l(e,t,o){var u=[],f=[e],l=[e],c=[o?n:"[Circular]"],h=e,p=1,d;return function(e,v){return t&&(v=t.call(this,e,v)),e!==""&&(h!==this&&(d=p-a.call(f,this)-1,p-=d,f.splice(p,f.length),u.splice(p-1,u.length),h=this),typeof v=="object"&&v?(a.call(f,v)<0&&f.push(h=v),p=f.length,d=a.call(l,v),d<0?(d=l.push(v)-1,o?(u.push((""+e).replace(s,r)),c[d]=n+u.join(n)):c[d]=c[0]):v=c[d]):typeof v=="string"&&o&&(v=v.replace(r,i).replace(n,r))),v}}function c(e,t){for(var r=0,i=t.length;r<i;e=e[t[r++].replace(o,n)]);return e}function h(e){return function(t,s){var o=typeof s=="string";return o&&s.charAt(0)===n?new f(s.slice(1)):(t===""&&(s=v(s,s,{})),o&&(s=s.replace(u,"$1"+n).replace(i,r)),e?e.call(this,t,s):s)}}function p(e,t,n){for(var r=0,i=t.length;r<i;r++)t[r]=v(e,t[r],n);return t}function d(e,t,n){for(var r in t)t.hasOwnProperty(r)&&(t[r]=v(e,t[r],n));return t}function v(e,t,r){return t instanceof Array?p(e,t,r):t instanceof f?t.length?r.hasOwnProperty(t)?r[t]:r[t]=c(e,t.split(n)):e:t instanceof Object?d(e,t,r):t}function m(t,n,r,i){return e.stringify(t,l(t,n,!i),r)}function g(t,n){return e.parse(t,h(n))}var n="~",r="\\x"+("0"+n.charCodeAt(0).toString(16)).slice(-2),i="\\"+r,s=new t(r,"g"),o=new t(i,"g"),u=new t("(?:^|([^\\\\]))"+i),a=[].indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},f=String;return{stringify:m,parse:g}}(JSON,RegExp);
    return CircularJSON.stringify(object);
};

OSH.Utils.destroyElement = function(element) {
    OSH.Asserts.checkIsDefineOrNotNull(element);
    OSH.Asserts.checkIsDefineOrNotNull(element.parentNode);

    element.parentNode.removeChild(element);
};

OSH.Utils.getChildNumber = function(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
};

OSH.Utils.searchPropertyByValue = function(object, propertyValue, resultArray) {
    var idx;

    for(var property in object) {
        if(!isUndefinedOrNull(object[property])) {
            if(OSH.Utils.isObject(object[property])) {
                OSH.Utils.searchPropertyByValue(object[property],propertyValue,resultArray);
            } else if(Array.isArray(object[property]) && (idx=object[property].indexOf(propertyValue)) > -1) {
                resultArray.push(object);
            } else if(OSH.Utils.isFunction(object[property])) {
                continue; // skip
            } else if(object[property] === propertyValue) {
                resultArray.push(object);
            }
        }
    }
};

OSH.Utils.binaryStringToBlob = function(binaryString) {
    var array = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++){
        array[i] = binaryString.charCodeAt(i);
    }
    var blob = new Blob([array], {type: 'application/octet-stream'});
    return URL.createObjectURL(blob);
};

OSH.Utils.fixSelectable = function(oElement, bGotFocus) {
    var oParent = oElement.parentNode;
    while(oParent !== null && !/\bdraggable\b/.test(oParent.className)) {
        oParent = oParent.parentNode;
    }
    if(oParent !== null) {
        oParent.draggable = !bGotFocus;
    }
};

// returns true if the element or one of its parents has the class classname
OSH.Utils.getSomeParentTheClass = function(element, classname) {
    if (element.className.split(' ').indexOf(classname)>=0) return element;
    return element.parentNode && OSH.Utils.getSomeParentTheClass(element.parentNode, classname);
};