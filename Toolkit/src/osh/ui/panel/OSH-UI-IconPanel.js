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

OSH.UI.Panel.IconPanel = OSH.UI.Panel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
        var self = this;
    },

    initPanel:function() {
        // type
        var typeInputId = OSH.Utils.addHTMLListBox(this.div,"Icon type", [
            "None",
            "Fixed",
            "Threshold",
            "Map"
        ]);

        this.content = document.createElement("div");
        this.div.appendChild(this.content);

        this.properties = {};

        // adds listeners
        var self = this;
        var typeInputElt = document.getElementById(typeInputId);

        typeInputElt.addEventListener("change", function () {
            var currentValue = (this.options[this.selectedIndex].value);
            // clear current content
            OSH.Utils.removeAllNodes(self.content);
            self.removeAllListerners();
            self.removeProps();

            switch (currentValue) {
                case "Threshold":
                    self.addThreshold();
                    break;
                case "Fixed" :
                    self.addFixed();
                    break;
                case "None" :
                    self.addNone();
                    break;
                default:
                    break;
            }
        });
    },


    removeProps:function() {
        delete this.properties.fixed;
        delete this.properties.threshold;
    },

    addNone:function() {
    },

    addFixed : function() {

        this.properties.fixed = {};

        // low icon
        var fixedIconInputId = OSH.Utils.addTitledFileChooser(this.content,"Fixed icon",true);

        // fixed icon
        var fixedIconInputElt = document.getElementById(fixedIconInputId);
        this.addListener(fixedIconInputElt, "change", this.inputFileHandler.bind(fixedIconInputElt,this.properties.fixed));

    },

    addThreshold:function() {

        this.properties.threshold = {};

        OSH.Utils.addHTMLTitledLine(this.content,"Data source");

        // data source
        var dsListBoxId = OSH.Utils.addHTMLListBox(this.content, "Data Source", []);
        var observableListBoxId = OSH.Utils.addHTMLListBox(this.content, "Observable", []);

        // default
        OSH.Utils.addHTMLTitledLine(this.content,"Default");
        var defaultIconInputId = OSH.Utils.addTitledFileChooser(this.content, "Default icon",true);

        // threshold
        OSH.Utils.addHTMLTitledLine(this.content,"Threshold");

        // low icon
        var lowIconInputId = OSH.Utils.addTitledFileChooser(this.content, "Low icon",true);

        // high icon
        var highIconInputId = OSH.Utils.addTitledFileChooser(this.content, "High icon",true);

        // threshold
        var thresholdInputId = OSH.Utils.addInputText(this.content, "Threshold value", "12.0");

        OSH.Utils.addHTMLTitledLine(this.content,"Interactive");

        // selected icon
        var selectedIconInputId = OSH.Utils.addTitledFileChooser(this.content, "Selected icon",true);


        var self = this;

        // adds listeners
        self.addListener(document.getElementById(dsListBoxId), "change", function () {
            self.properties.threshold.datasource = this.options[this.selectedIndex].value;
        });

        self.addListener(document.getElementById(observableListBoxId), "change", function () {
            self.properties.threshold.observable = this.options[this.selectedIndex].value;
        });

        var defaultIconInputElt = document.getElementById(defaultIconInputId);
        self.addListener(defaultIconInputElt, "change", this.inputFileHandler.bind(defaultIconInputElt,self.properties.threshold.default));


        var lowIconInputElt = document.getElementById(lowIconInputId);
        self.addListener(lowIconInputElt, "change", this.inputFileHandler.bind(lowIconInputElt,self.properties.threshold.lowIcon));

        var highIconInputElt = document.getElementById(highIconInputId);
        self.addListener(highIconInputElt, "change", this.inputFileHandler.bind(highIconInputElt,self.properties.threshold.highIcon));

        self.addListener(document.getElementById(thresholdInputId), "change", function () {
            self.properties.threshold.value = this.value;
        });

        var selectIconInputElt = document.getElementById(selectedIconInputId);
        self.addListener(selectIconInputElt, "change", this.inputFileHandler.bind(selectIconInputElt,self.properties.threshold.selectedIcon));
    },

    inputFileHandler:function(property,evt) {
        var file = evt.target.files[0];
        var reader = new FileReader();

        // Closure to capture the file information.
        var inputElt = this;
        reader.onload = (function(theFile) {
            property.blob = theFile;
            return function(e) {
                var base64Image = e.target.result;
                var sel = inputElt.parentNode.querySelectorAll("div.preview")[0];
                sel.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');


            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
    }
});