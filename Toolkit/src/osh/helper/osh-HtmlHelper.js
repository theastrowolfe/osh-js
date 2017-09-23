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
OSH.Helper.HtmlHelper = function() {};

OSH.Helper.HtmlHelper.createHTMLTitledLine = function(title) {
    var div = document.createElement("div");
    div.setAttribute("class","horizontal-titled-line");
    div.innerHTML = title;

    return div;
};

OSH.Helper.HtmlHelper.addHTMLLine = function(parentElt) {
    parentElt.appendChild(OSH.Helper.HtmlHelper.createHTMLLine());
};

OSH.Helper.HtmlHelper.addHTMLTitledLine = function(parentElt,title) {
    parentElt.appendChild(OSH.Helper.HtmlHelper.createHTMLTitledLine(title));
};


OSH.Helper.HtmlHelper.HTMLListBoxSetSelected = function(listboxElt, defaultValue) {

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

OSH.Helper.HtmlHelper.addHTMLTextArea = function(parentElt,content) {
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

OSH.Helper.HtmlHelper.onDomReady = function(callback) {
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

OSH.Helper.HtmlHelper.addTitledFileChooser = function(div,label, createPreview, defaultInputDivId) {
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

        (function(inputElt) {
            OSH.Helper.HtmlHelper.onDomReady(function(){
                inputElt.addEventListener('change', function(evt) {
                    var file = evt.target.files[0];
                    var reader = new FileReader();

                    // Closure to capture the file information.
                    var inputElt = this;

                    reader.onload = (function(theFile) {
                        inputElt.nextSibling.text = theFile.name;
                        inputElt.nextSibling.value = theFile.name;
                        return function(e) {
                            var sel = inputElt.parentNode.querySelectorAll("div.preview")[0];
                            sel.innerHTML = ['<img class="thumb" src="', e.target.result,
                                '" title="', escape(e.target.result), '"/>'].join('');
                        };
                    })(file);

                    // Read in the image file as a data URL.
                    reader.readAsDataURL(file);
                }, false);

                inputElt.nextElementSibling.addEventListener("paste",function(evt){
                    OSH.Asserts.checkIsDefineOrNotNull(evt);

                    var clipboardData = evt.clipboardData || window.clipboardData;
                    var pastedData = clipboardData.getData('Text');

                    var sel = this.parentNode.querySelectorAll("div.preview")[0];
                    sel.innerHTML = ['<img class="thumb" src="', pastedData,
                        '" title="', escape(pastedData), '"/>'].join('');
                });
            });
        })(inputFileElt); //passing the variable to freeze, creating a new closure
        div.appendChild(ulElt);
    } else {
        div.appendChild(ulElt);
    }
    return id;
};

OSH.Helper.HtmlHelper.addInputTextValueWithUOM = function(parentElt, label,placeholder,uom) {
    var id = OSH.Utils.randomUUID();

    var ulElt = document.createElement("ul");
    ulElt.setAttribute("class","osh-ul");

    var liElt =  document.createElement("li");
    liElt.setAttribute("class","osh-li");

    var inputElt = document.createElement("input");
    inputElt.setAttribute("id",id+"");
    inputElt.setAttribute("class","input-text input-uom");
    inputElt.setAttribute("type","input-text");
    inputElt.setAttribute("name",""+id);


    if(!isUndefinedOrNull(placeholder)) {
        inputElt.setAttribute("placeholder",placeholder);
    }

    var uomElt = document.createElement("div");
    uomElt.setAttribute("class","uom");
    uomElt.innerHTML = ""+uom;

    if(!isUndefinedOrNull(label)) {
        var labelElt = document.createElement("label");
        labelElt.setAttribute("for",""+id);
        labelElt.innerHTML = label+":";

        liElt.appendChild(labelElt);
    }

    liElt.appendChild(inputElt);
    liElt.appendChild(uomElt);
    ulElt.appendChild(liElt);

    parentElt.appendChild(ulElt);

    return id;
};

OSH.Helper.HtmlHelper.addInputText = function(parentElt, label,defaultValue,placeholder) {
    var id = OSH.Utils.randomUUID();

    var ulElt = document.createElement("ul");
    ulElt.setAttribute("class","osh-ul");

    var liElt =  document.createElement("li");
    liElt.setAttribute("class","osh-li");

    var inputElt = document.createElement("input");
    inputElt.setAttribute("id",id+"");
    inputElt.setAttribute("class","input-text");
    inputElt.setAttribute("type","input-text");
    inputElt.setAttribute("name",""+id);

    if(!isUndefinedOrNull(defaultValue) && defaultValue !== "") {
        inputElt.setAttribute("value",defaultValue);
    }

    if(!isUndefinedOrNull(placeholder)) {
        inputElt.setAttribute("placeholder",placeholder);
    }

    if(!isUndefinedOrNull(label)) {
        var labelElt = document.createElement("label");
        labelElt.setAttribute("for",""+id);
        labelElt.innerHTML = label+":";

        liElt.appendChild(labelElt);
    }

    liElt.appendChild(inputElt);
    ulElt.appendChild(liElt);

    parentElt.appendChild(ulElt);

    return id;
};


OSH.Helper.HtmlHelper.removeAllNodes = function(div) {
    if(!isUndefinedOrNull(div)) {
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }
};

OSH.Helper.HtmlHelper.removeAllFromSelect = function(tagId) {
    var i;
    var selectTag = document.getElementById(tagId);
    for (i = selectTag.options.length - 1; i >= 0; i--) {
        selectTag.remove(i);
    }
};

OSH.Helper.HtmlHelper.addHTMLListBox = function(parentElt,label,values,defaultTitleOption,defaultSelectTagId) {
    var ul = document.createElement("ul");
    ul.setAttribute("class","osh-ul");

    var id = OSH.Utils.randomUUID();
    var selectTagId = OSH.Utils.randomUUID();

    var ulElt = document.createElement("ul");
    ulElt.setAttribute("class","osh-ul");

    var liElt =  document.createElement("li");
    liElt.setAttribute("class","osh-li");

    if(!isUndefinedOrNull(defaultSelectTagId)) {
        selectTagId = defaultSelectTagId;
    }


    if(!isUndefinedOrNull(label) && label !== "") {
        var labelElt = document.createElement("label");
        labelElt.innerHTML = label;

        liElt.appendChild(labelElt);
    }

    var divElt = document.createElement("div");
    divElt.setAttribute("id",""+id);
    divElt.setAttribute("class","select-style");

    var selectElt = document.createElement("select");
    selectElt.setAttribute("id",""+selectTagId);

    if(!isUndefinedOrNull(defaultTitleOption)) {
        var optionElt = document.createElement("option");
        optionElt.setAttribute("value","");
        optionElt.setAttribute("disabled","");
        optionElt.setAttribute("selected","");
        optionElt.innerHTML = defaultTitleOption;

        selectElt.appendChild(optionElt);
    }

    if(!isUndefinedOrNull(values)) {
        var first = true;
        var optionElt;

        for(var key in values) {
            optionElt = document.createElement("option");
            optionElt.setAttribute("value",values[key]);
            optionElt.innerHTML = values[key]+"";

            if(first) {
                optionElt.setAttribute("selected","");
                first = false;
            }

            selectElt.appendChild(optionElt);
        }
    }

    divElt.appendChild(selectElt);

    liElt.appendChild(divElt);
    ulElt.appendChild(liElt);

    parentElt.appendChild(ulElt);

    return selectTagId;
};