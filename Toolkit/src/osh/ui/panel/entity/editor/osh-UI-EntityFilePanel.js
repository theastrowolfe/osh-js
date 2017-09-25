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

OSH.UI.Panel.EntityFilePanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);
    },

    initPanel:function() {
        // LOAD part
        var loadDivElt = document.createElement("div");

        // adds button
        var loadButtonElt = document.createElement("button");
        loadButtonElt.setAttribute("id",OSH.Utils.randomUUID());
        loadButtonElt.setAttribute("class","submit load-button");
        loadButtonElt.setAttribute("disabled",""); // disabled by default

        loadButtonElt.innerHTML = "Load";

        loadDivElt.appendChild(loadButtonElt);

        // adds input field
        var inputFileEltId = OSH.Helper.HtmlHelper.addFileChooser(loadDivElt);

        var self = this;

        OSH.Helper.HtmlHelper.onDomReady(function(){
            var nextElt = document.getElementById("text-"+inputFileEltId);
            nextElt.className += " load-settings ";

            // listeners
            var inputFileElt = document.getElementById(inputFileEltId);

            var lastDataLoaded;

            self.addListener(inputFileElt, "change", self.inputFileHandlerAsText.bind(inputFileElt,function(result) {
                self.enableElt(loadButtonElt.id);

                lastDataLoaded = result;
            }));

            self.addListener(loadButtonElt,"click",function(evt) {
                if(!isUndefinedOrNull(lastDataLoaded)) {
                    try{
                        self.loadProperties(lastDataLoaded.data);
                    } catch(exception) {
                        throw new OSH.Exception.Exception("Cannot convert '"+lastDataLoaded.file.name+"' into JSON: "+exception);
                    }
                }
            });
        });

        // SAVE part
        var divSaveElt = document.createElement("div");
        divSaveElt.setAttribute("class","save");

        // adds button
        var saveButtonElt = document.createElement("button");
        saveButtonElt.setAttribute("id",OSH.Utils.randomUUID());
        saveButtonElt.setAttribute("class","submit load-button");

        saveButtonElt.innerHTML = "Save";

        divSaveElt.appendChild(saveButtonElt);

        // adds input field
        var defaultName = "entity-properties.json";
        var inputTextSaveEltId = OSH.Helper.HtmlHelper.addInputText(divSaveElt,null,defaultName,"filename.json");


        OSH.Helper.HtmlHelper.onDomReady(function() {
            var inputTextElt = document.getElementById(inputTextSaveEltId);
            self.addListener(saveButtonElt, "click", function (evt) {
                var inputTextValue = inputTextElt.value;
                var fileName = defaultName;

                if(!isUndefinedOrNull(inputTextValue) && inputTextValue !== "") {
                    fileName = inputTextValue;
                }

                self.savePropertiesHandler(fileName);
            });
        });

        this.divElt.appendChild(loadDivElt);
        this.divElt.appendChild(divSaveElt);
    },

    saveProperties: function(properties,fileName) {
        try {
            var blob = new Blob([JSON.stringify(properties)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, fileName);
        } catch(exception) {
            throw new OSH.Exception.Exception("Cannot save the data as file: "+fileName);
        }

    },

    loadProperties : function(textData,fileName) {
        try{
            this.loadPropertiesHandler(JSON.parse(textData));
        } catch(exception) {
            throw new OSH.Exception.Exception("Cannot convert '"+fileName+"' into JSON: "+exception);
        }
    },

    loadPropertiesHandler:function(jsonProperties) {},

    savePropertiesHandler:function(filename) {
        var props = this.beforeOnSaveProperties();
        this.saveProperties(props,filename);
    },

    beforeOnSaveProperties:function() {
        return [];
    }
});