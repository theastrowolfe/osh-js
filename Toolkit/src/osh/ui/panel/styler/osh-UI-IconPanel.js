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

OSH.UI.Panel.IconPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        // type
        this.typeInputId = OSH.Utils.addHTMLListBox(this.div,"Icon type", [
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
        var typeInputElt = document.getElementById(this.typeInputId);

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

    loadData:function(defautlProperties) {
        //-- sets icon type
        var typeInputElt = document.getElementById(this.typeInputId);

        console.log(defautlProperties);
        if(!isUndefinedOrNull(defautlProperties.fixed)) {
            // loads fixed
            typeInputElt.options.selectedIndex = 0;

            //this.setInputFileValue(document.getElementById(fixedIconInputId),defautlProperties.fixed.blob);
        } else if(!isUndefinedOrNull(defautlProperties.threshold)) {
            // loads threshold
            typeInputElt.options.selectedIndex = 1;
        }
    },

    addNone:function() {
    },

    addFixed : function() {

        this.properties.fixed = {};

        // low icon
        var fixedIconInputId = OSH.Utils.addTitledFileChooser(this.content,"Fixed icon",true);

        // fixed icon
        var fixedIconInputElt = document.getElementById(fixedIconInputId);

        var self = this;

        this.addListener(fixedIconInputElt, "change", this.inputFileHandler.bind(fixedIconInputElt,function(result) {
            self.properties.fixed = result; // should be  result = { blob: someBlob }
        }));

    },

    addThreshold:function() {

        this.properties.threshold = {
             lowIcon:null,
             highIcon:null,
             defaultIcon:null,
             selectedIcon:null,
             datasource:null,
             observableIdx:null
        };

        OSH.Utils.addHTMLTitledLine(this.content,"Data source");

        // data source
        var dsName = [];
        for(var i=0;i < this.options.datasources.length;i++) {
            dsName.push(this.options.datasources[i].name);
        }

        if(this.options.datasources.length > 0) {
            this.properties.threshold.datasource = this.options.datasources[0];
        }

        var dsListBoxId = OSH.Utils.addHTMLListBox(this.content, "Data Source", dsName);
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
        var thresholdInputId = OSH.Utils.addInputTextValueWithUOM(this.content, "Threshold value", "12.0","");

        OSH.Utils.addHTMLTitledLine(this.content,"Interactive");

        // selected icon
        var selectedIconInputId = OSH.Utils.addTitledFileChooser(this.content, "Selected icon",true);

        this.loadObservable(dsListBoxId,observableListBoxId,thresholdInputId);
        this.loadUom(observableListBoxId,thresholdInputId);

        var self = this;

        // adds listeners

        self.addListener(document.getElementById(dsListBoxId), "change", function () {
            self.properties.threshold.datasource = this.options[this.selectedIndex].value;

            // updates observable listbox
            self.loadObservable(dsListBoxId,observableListBoxId);
        });

        self.addListener(document.getElementById(observableListBoxId), "change", function () {
            self.properties.threshold.observableIdx = this.selectedIndex;

            // updates uom
            self.loadUom(observableListBoxId,thresholdInputId);
        });

        var defaultIconInputElt = document.getElementById(defaultIconInputId);

        this.addListener(defaultIconInputElt, "change", this.inputFileHandler.bind(defaultIconInputElt,function(result) {
            self.properties.threshold.defaultIcon = result; // should be  result = { blob: someBlob }
        }));

        var lowIconInputElt = document.getElementById(lowIconInputId);
        this.addListener(lowIconInputElt, "change", this.inputFileHandler.bind(lowIconInputElt,function(result) {
            self.properties.threshold.lowIcon = result; // should be  result = { blob: someBlob }
        }));

        var highIconInputElt = document.getElementById(highIconInputId);
        this.addListener(highIconInputElt, "change", this.inputFileHandler.bind(highIconInputElt,function(result) {
            self.properties.threshold.highIcon = result; // should be  result = { blob: someBlob }
        }));

        this.addListener(document.getElementById(thresholdInputId), "change", function () {
            self.properties.threshold.value = this.value;
        });

        var selectIconInputElt = document.getElementById(selectedIconInputId);
        this.addListener(selectIconInputElt, "change", this.inputFileHandler.bind(selectIconInputElt,function(result) {
            self.properties.threshold.selectedIcon = result; // should be  result = { blob: someBlob }
        }));
    },

    getProperties:function() {
        return this.properties;
    }
});