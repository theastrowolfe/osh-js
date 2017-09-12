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

OSH.Utils.copyProperties = function(firstObject,secondObject) {
    for (var k in firstObject) secondObject[k] = firstObject[k];
};

OSH.Utils.addHTMLLine = function(div) {
    div.innerHTML += OSH.Utils.createHTMLLine();
};

OSH.Utils.addHTMLTitledLine = function(div,title) {
    div.innerHTML += OSH.Utils.createHTMLTitledLine(title);
};

OSH.Utils.createHTMLLine = function() {
    return "<div class=\"horizontal-line\"><\/div>";
};

OSH.Utils.createHTMLTitledLine = function(title) {
    return "<div class=\"horizontal-titled-line\">"+title+"<\/div>";
};

OSH.Utils.addHTMLListBox = function(div,label,values,defaultTitleOption,defaultSelectTagId) {
    var ul = document.createElement("ul");
    ul.setAttribute("class","osh-ul");

    var strVar = "<li class=\"osh-li\">";

    var selectTagId = OSH.Utils.randomUUID();
    var divId = OSH.Utils.randomUUID();

    if(!isUndefinedOrNull(defaultSelectTagId)) {
        selectTagId = defaultSelectTagId;
    }

    if(!isUndefinedOrNull(label) && label !== "") {
      strVar += "    <label>"+label+"<\/label>";
    }
    strVar += "      <div class=\"select-style\" id=\""+divId+"\">";
    strVar += "         <select id=\"" + selectTagId + "\">";

    if(!isUndefinedOrNull(defaultTitleOption)) {
        strVar += "            <option value=\"\" disabled selected>"+defaultTitleOption+"<\/option>";
    }

    if(!isUndefinedOrNull(values)) {
        var first = true;
        for(var key in values) {
            if(first) {
                strVar += "            <option  selected value=\"" + values[key] + "\">" + values[key] + "<\/option>";
                first = false;
            } else {
                strVar += "            <option value=\"" + values[key] + "\">" + values[key] + "<\/option>";
            }
        }
    }
    strVar += "     <\/select><\/div><\/li>";
    ul.innerHTML += strVar;

    div.appendChild(ul);
    return selectTagId;
};

OSH.Utils.HTMLListBoxSetSelected = function(listboxElt, defaultValue) {

    if(isUndefinedOrNull(defaultValue) || defaultValue === "") {
        return;
    }

    for(var i=0; i < listboxElt.options.length;i++) {
        var currentOption = listboxElt.options[i].value;

        if(currentOption === defaultValue) {
            listboxElt.options[i].setAttribute("selected","");
            break;
        }
    }
};

OSH.Utils.addHTMLTextArea = function(parentElt,content) {
    var ulElt = document.createElement("ul");
    ulElt.setAttribute("class","osh-ul");

    var liElt =  document.createElement("li");
    liElt.setAttribute("class","osh-li");

    var textareaId = OSH.Utils.randomUUID();
    var textAreaElt = document.createElement("textarea");
    textAreaElt.setAttribute("class","text-area");
    textAreaElt.setAttribute("id",textareaId);

    textAreaElt.value = content;

    // appends textarea
    liElt.appendChild(textAreaElt);

    // appends li to ul
    ulElt.appendChild(liElt);

    parentElt.appendChild(ulElt);

    return textareaId;
};

OSH.Utils.addTitledFileChooser = function(div,label, createPreview, defaultInputDivId) {
    var id = OSH.Utils.randomUUID();

    if(!isUndefined(defaultInputDivId)) {
      id = defaultInputDivId;
    }

    var ulElt = document.createElement("ul");
    ulElt.setAttribute("class","osh-ul");

    var liElt =  document.createElement("li");
    liElt.setAttribute("class","osh-li");

    var labelElt = document.createElement("label");
    labelElt.innerHTML = label;

    var labelForElt = document.createElement("label");
    labelForElt.setAttribute("class","input-file-label-for");
    labelForElt.setAttribute("for",id);

    var iElt = document.createElement("i");
    iElt.setAttribute("class","fa input-file-i");
    iElt.setAttribute("aria-hidden","true");

    labelForElt.appendChild(iElt);

    var inputTextElt = document.createElement("input");
    inputTextElt.setAttribute("class","input-file-text");
    inputTextElt.setAttribute("id","text-"+id);
    inputTextElt.setAttribute("type","text");
    inputTextElt.setAttribute("name","file-text-"+id);

    var inputFileElt = document.createElement("input");
    inputFileElt.setAttribute("class","input-file");
    inputFileElt.setAttribute("id",id);
    inputFileElt.setAttribute("type","file");
    inputFileElt.setAttribute("name","file-"+id);

    // appends label
    liElt.appendChild(labelElt);

    // appends label for
    liElt.appendChild(labelForElt);

    // appends input file
    liElt.appendChild(inputFileElt);

    // appends input text
    liElt.appendChild(inputTextElt);

    // appends li to ul
    ulElt.appendChild(liElt);

    // appends preview if any
    if(!isUndefinedOrNull(createPreview) && createPreview) {
        var prevId = OSH.Utils.randomUUID();

        var divPrevElt =  document.createElement("div");
        divPrevElt.setAttribute("class","preview");
        divPrevElt.setAttribute("id",prevId);

        OSH.Utils.addCss(inputFileElt,"preview");
        OSH.Utils.addCss(inputTextElt,"preview");

        liElt.appendChild(divPrevElt);

        // NOT working?!!!
        inputFileElt.addEventListener('change', function() {
            console.log("onchange");
        }, false);

        div.appendChild(ulElt);
    } else {
        div.appendChild(ulElt);
    }


    /*var strVar = "<ul class=\"osh-ul\"><li class=\"osh-li\">";
    strVar += "<label for=\"file-"+id+"\">"+label+"<\/label>";
    if(!isUndefinedOrNull(createPreview) && createPreview) {
        var prevId = OSH.Utils.randomUUID();
        strVar += "<input id=\""+id+"\"  class=\"input-file preview\" type=\"file\" name=\"file-"+id+"\" onchange=\""+handleFileSelect()+ "\" />";
        strVar += "<div id=\""+prevId+"\"class=\"preview\"/>";

        function handleFileSelect(evt) {
           console.log("ici");
           /* var files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {

                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        // Render thumbnail.
                        var span = document.createElement('span');
                        span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');

                        OSH.Utils.removeAllNodes(document.getElementById('prevId'));
                        document.getElementById('prevId').appendChild(span, null);
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            }
        }

        strVar += "<\/li><\/ul>";
        // adds to div
        div.innerHTML += strVar;

        document.getElementById(id).addEventListener('change', handleFileSelect);
    } else {
        strVar += "<input id=\""+id+"\"  class=\"input-file\" type=\"file\" name=\""+id+"\" />";

        strVar += "<\/li><\/ul>";
        // adds to div
        div.innerHTML += strVar;
    }
*/

    return id;
};

OSH.Utils.addInputTextValueWithUOM = function(div, label,placeholder,uom) {
    var id = OSH.Utils.randomUUID();

    var strVar = "<ul class=\"osh-ul\"><li class=\"osh-li\">";
    if(!isUndefinedOrNull(label)) {
        strVar += "<label for=\"" + id + "\">" + label + "<\/label>";
    }

    if(!isUndefinedOrNull(placeholder)) {
        strVar += "<input id=\"" + id + "\"  class=\"input-text  input-uom\" type=\"input-text\" name=\"" + id + "\" placeholder=\""+placeholder+"\"/>";
    } else {
        strVar += "<input id=\"" + id + "\"  class=\"input-text  input-uom\" type=\"input-text\" name=\"" + id + "\" />";
    }

    strVar += "<div class=\"uom\">"+uom+"</div>";
    strVar += "<\/li><\/ul>";

    // adds to div
    div.innerHTML += strVar;

    return id;
};

OSH.Utils.addInputText = function(div, label,defaultValue,placeholder) {
    var id = OSH.Utils.randomUUID();

    var strVar = "<ul class=\"osh-ul\"><li class=\"osh-li\">";
    if(!isUndefinedOrNull(label)) {
        strVar += "<label for=\"" + id + "\">" + label + ":<\/label>";
    }

    var extraAttrs = "";

    if(!isUndefinedOrNull(defaultValue) && defaultValue !== "") {
        extraAttrs += "value=\""+defaultValue+"\"";
    }

    if(!isUndefinedOrNull(placeholder)) {
        extraAttrs += "placeholder=\""+placeholder+"\"";
    }

    strVar += "<input id=\"" + id + "\"  class=\"input-text\" type=\"input-text\" name=\"" + id + "\" "+extraAttrs+" />";

    strVar += "<\/li><\/ul>";

    // adds to div
    div.innerHTML += strVar;

    return id;
};

OSH.Utils.removeAllNodes = function(div) {
  if(!isUndefinedOrNull(div)) {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
  }
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

OSH.Utils.removeAllFromSelect = function(tagId) {
    var i;
    var selectTag = document.getElementById(tagId);
    for (i = selectTag.options.length - 1; i >= 0; i--) {
        selectTag.remove(i);
    }
};

OSH.Utils.onDomReady = function(callback) {
    /*!
     * domready (c) Dustin Diaz 2014 - License MIT
     * https://github.com/ded/domready
     */
    !function (name, definition) {

        if (typeof module != 'undefined') module.exports = definition();
        else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
        else this[name] = definition();

    }('domready', function () {

        var fns = [], listener
            , doc = typeof document === 'object' && document
            , hack = doc && doc.documentElement.doScroll
            , domContentLoaded = 'DOMContentLoaded'
            , loaded = doc && (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);


        if (!loaded && doc)
            doc.addEventListener(domContentLoaded, listener = function () {
                doc.removeEventListener(domContentLoaded, listener);
                loaded = 1;
                while (listener = fns.shift()) listener();
            });

        return function (fn) {
            loaded ? setTimeout(fn, 0) : fns.push(fn);
        }
    });

    // End domready(c)

    domready(callback);
};

OSH.Utils.arrayBufferToImageDataURL = function(arraybuffer) {
    var blob = new Blob([new Uint8Array(arraybuffer)]);
    return URL.createObjectURL(blob);
};

OSH.Utils.createJSEditor = function(parentElt,content) {
    return OSH.Utils.addHTMLTextArea(parentElt, js_beautify(content));
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
