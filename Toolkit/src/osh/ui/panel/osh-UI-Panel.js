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


OSH.UI.Panel = BaseClass.extend({
    initialize: function (parentElementDivId,options) {
        this.divId = "panel-"+OSH.Utils.randomUUID();
        this.options = options;
        this.elementDiv = document.createElement("div");
        this.elementDiv.setAttribute("class", "osh panel");
        this.elementDiv.setAttribute("id", this.divId);

        if(!isUndefinedOrNull(parentElementDivId) && parentElementDivId !== "") {
            document.getElementById(parentElementDivId).appendChild(this.elementDiv);
        } else {
            document.body.appendChild(this.elementDiv);
        }

        this.componentListeners = [];

        if(!isUndefinedOrNull(options)) {
            if(!isUndefinedOrNull(options.css)) {
                OSH.Utils.addCss(this.elementDiv,options.css);
            }
        }
        this.initPanel();
        this.handleEvents();
    },

    initPanel:function() {},

    addListener: function(div,listenerName, func) {
        OSH.Asserts.checkIsDefineOrNotNull(div);
        OSH.Asserts.checkIsDefineOrNotNull(func);

        OSH.Helper.HtmlHelper.onDomReady(function() {
            div.addEventListener(listenerName, func, false);
            this.componentListeners.push({
                div: div,
                name: listenerName,
                func: func
            });
        }.bind(this));
    },

    removeAllListerners:function() {
        for(var key in this.componentListeners) {
            var elt = this.componentListeners[key];
            elt.div.removeEventListener(elt.name,elt.func);
        }
    },

    getAsHTML:function() {
        return this.elementDiv.outerHTML;
    },

    /**
     *
     * @param divId
     * @instance
     * @memberof OSH.UI.Panel
     */
    attachTo : function(divId) {
        if(typeof this.elementDiv.parentNode !== "undefined") {
            // detach from its parent
            this.elementDiv.parentNode.removeChild(this.elementDiv);
        }
        document.getElementById(divId).appendChild(this.elementDiv);
        if(this.elementDiv.style.display === "none") {
            this.elementDiv.style.display = "block";
        }
        this.onResize();
    },

    /**
     * @instance
     * @memberof OSH.UI.Panel
     */
    onResize:function() {
    },

    inputFileHandlerAsBinaryString:function(callbackFn,evt) {
        var file = evt.target.files[0];
        var reader = new FileReader();

        // Closure to capture the file information.
        var inputElt = this;
        reader.onload = (function(theFile) {
            inputElt.nextSibling.text = theFile.name;
            inputElt.nextSibling.value = theFile.name;

            return function(e) {
                var l, d, array;
                d = e.target.result;
                l = d.length;
                array = new Uint8Array(l);
                for (var i = 0; i < l; i++){
                    array[i] = d.charCodeAt(i);
                }
                var blob = new Blob([array], {type: 'application/octet-stream'});
                callbackFn({
                    url:URL.createObjectURL(blob),
                    binaryString:d,
                    name:theFile.name,
                    length:l
                });
            };
        })(file);

        // Read in the image file as a binary string.
        reader.readAsBinaryString(file);
    },

    inputFileHandlerAsText:function(callbackFn,evt) {
        var file = evt.target.files[0];
        var reader = new FileReader();

        // Closure to capture the file information.
        var inputElt = this;
        reader.onload = (function(theFile) {
            inputElt.nextSibling.text = theFile.name;
            inputElt.nextSibling.value = theFile.name;

            return function(e) {
                callbackFn({
                    data:e.target.result,
                    file: theFile
                });
            };
        })(file);

        // Read in the image file as a binary string.
        reader.readAsText(file);
    },

    inputFilePasteHandler : function(callbackFn,evt) {
        OSH.Asserts.checkIsDefineOrNotNull(evt);

        var clipboardData = evt.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData('Text');

        var name = "";
        var split = pastedData.split("/");
        if(split.length > 0) {
            name = split[split.length-1];
        }

        callbackFn({
            url:pastedData,
            name:name
        });
    },

    setInputFileValue:function(inputElt,props /** name,arraybuffer,type **/) {
        if(!isUndefinedOrNull(props)) {
            var url = props.url;

            var sel = inputElt.parentNode.querySelectorAll("div.preview")[0];
            sel.innerHTML = ['<img class="thumb" src="', url,
                '" title="', escape(props.name), '"/>'].join('');

            inputElt.nextSibling.text = props.name;
            inputElt.nextSibling.value = props.name;
        }
    },

    //TODO: to move into HELPER
    removeAllFromSelect:function(tagId) {
        var i;
        var selectTag = document.getElementById(tagId);
        for (i = selectTag.options.length - 1; i > 0; i--) {
            selectTag.remove(i);
        }
    },

    //TODO: to move into HELPER
    removeAllFromSelectElement:function(element) {
        var i;
        for (i = element.options.length - 1; i > 0; i--) {
            element.remove(i);
        }
    },

    /**
     * Show the view by removing display:none style if any.
     * @param properties
     * @instance
     * @memberof OSH.UI.Panel
     */
    show: function(properties) {
    },

    /**
     *
     * @param properties
     * @instance
     * @memberof OSH.UI.Panel
     */
    shows: function(properties) {
    },

    handleEvents:function() {
        // observes the SHOW event
        OSH.EventManager.observe(OSH.EventManager.EVENT.SHOW_VIEW,function(event){
            this.show(event);
        }.bind(this));

        OSH.EventManager.observe(OSH.EventManager.EVENT.RESIZE+"-"+this.divId,function(event){
            this.onResize();
        }.bind(this));
    },

    setVisible:function(isVisible) {
        if(!isVisible) {
            this.elementDiv.style.displayOld = window.getComputedStyle(this.elementDiv).getPropertyValue('display');
            this.elementDiv.style.display = "none";
        } else if(!isUndefinedOrNull(this.elementDiv.style.displayOld)) {
            this.elementDiv.style.display = this.elementDiv.style.displayOld;
        } else {
            this.elementDiv.style.display = "block";
        }
    }
});