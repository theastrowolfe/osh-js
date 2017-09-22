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
        this.typeInputId = OSH.Utils.addHTMLListBox(this.divElt,"Icon type", [
            "None",
            "Fixed",
            "Threshold",
            "Map",
            "Custom"
        ]);

        this.content = document.createElement("div");
        this.divElt.appendChild(this.content);

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
                case "Custom" :
                    self.addCustom();
                    break;
                case "None" :
                    self.addNone();
                    break;
                default:
                    break;
            }
        });

        this.initDefaultValues();
    },


    initDefaultValues:function(){
        // load existing values if any
        // load UI settings

        //-- sets icon type
        var typeInputElt = document.getElementById(this.typeInputId);

        if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.icon")) {
            if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.icon.fixed")) {
                // loads fixed
                typeInputElt.options.selectedIndex = 1;
                this.addFixed(this.styler.ui.icon.fixed);
            } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.icon.threshold")) {
                // loads threshold
                typeInputElt.options.selectedIndex = 2;
                this.addThreshold(this.styler.ui.icon.threshold);
            } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.icon.map")) {
                // loads map
                typeInputElt.options.selectedIndex = 3;
                this.addMap(this.styler.ui.icon.map);
            } else if (OSH.Utils.hasOwnNestedProperty(this.styler, "ui.icon.custom")) {
                // loads custom
                typeInputElt.options.selectedIndex = 4;
                this.addCustom(this.styler.ui.icon.custom);
            }
        } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.iconFunc")) {
            typeInputElt.options.selectedIndex = 4;
            this.addCustom(this.styler.properties.iconFunc.handler.toSource());
        }
    },

    removeProps:function() {
        delete this.properties.fixed;
        delete this.properties.threshold;
    },

    addNone:function() {
        this.properties = {};
    },

    addFixed : function(defaultProperties) {

        this.properties = {
            fixed: {
                defaultIcon: null,
                selectedIcon: null
            }
        };

        // low icon
        this.defaultIconInputId = OSH.Utils.addTitledFileChooser(this.content,"Default icon",true);

        // default icon
        var defaultIconInputElt = document.getElementById(this.defaultIconInputId);

        // selected icon
        var selectedIconInputId = OSH.Utils.addTitledFileChooser(this.content, "Selected icon",true);

        var selectedIconInputElt = document.getElementById(selectedIconInputId);

        var self = this;

        this.addListener(defaultIconInputElt, "change", this.inputFileHandler.bind(defaultIconInputElt,function(result) {
            self.properties.fixed.defaultIcon = result;
        }));

        this.addListener(defaultIconInputElt.nextElementSibling, "paste", this.inputFileKeyHandler.bind(defaultIconInputElt.nextElementSibling,function(result) {
            if(!isUndefinedOrNull(result)) {
                self.properties.fixed.defaultIcon = result;
            }
        }));

        this.addListener(defaultIconInputElt, "change", this.inputFileHandler.bind(defaultIconInputElt,function(result) {
            self.properties.fixed.defaultIcon = result;
        }));



        this.addListener(selectedIconInputElt, "change", this.inputFileHandler.bind(selectedIconInputElt,function(result) {
            self.properties.fixed.selectedIcon = result;
        }));

        // edit values
        if(!isUndefinedOrNull(defaultProperties)){
            this.setInputFileValue(defaultIconInputElt,defaultProperties.defaultIcon);
            this.setInputFileValue(selectedIconInputElt,defaultProperties.selectedIcon);

            this.properties.fixed.defaultIcon = defaultProperties.defaultIcon;
            this.properties.fixed.selectedIcon = defaultProperties.selectedIcon;
        }
    },

    addThreshold:function(defaultProperties) {

        this.properties = {
            threshold : {
                lowIcon: null,
                highIcon: null,
                defaultIcon: null,
                datasource: null,
                observableIdx: null
            }
        };

        OSH.Utils.addHTMLTitledLine(this.content,"Data source");

        // data source
        var dsName = [];
        for(var i=0;i < this.options.datasources.length;i++) {
            dsName.push(this.options.datasources[i].name);
        }

        if(this.options.datasources.length > 0) {
            this.properties.threshold.datasourceIdx = 0;
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

        if(!this.loadObservable(dsListBoxId,observableListBoxId,thresholdInputId)) {
            this.properties.threshold.observableIdx = 0;
        }

        this.loadUom(observableListBoxId,thresholdInputId);

        var self = this;

        // adds listeners

        self.addListener(document.getElementById(dsListBoxId), "change", function () {
            self.properties.threshold.datasourceIdx = this.selectedIndex;

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

        // edit values
        if(!isUndefinedOrNull(defaultProperties)) {
            this.setInputFileValue(defaultIconInputElt,defaultProperties.defaultIcon);
            this.setInputFileValue(lowIconInputElt,defaultProperties.lowIcon);
            this.setInputFileValue(highIconInputElt,defaultProperties.highIcon);
            document.getElementById(thresholdInputId).value = defaultProperties.value;

            this.properties.threshold.defaultIcon = defaultProperties.defaultIcon;
            this.properties.threshold.lowIcon = defaultProperties.lowIcon;
            this.properties.threshold.highIcon = defaultProperties.highIcon;
            this.properties.threshold.value = defaultProperties.value;
        }
    },

    addCustom:function(textContent) {
        this.properties = {
            custom: {}
        };

        var defaultValue = "";

        if(!isUndefinedOrNull(textContent)) {
            defaultValue = textContent;
        }

        this.textareaId = OSH.Utils.createJSEditor(this.content,defaultValue);
    },

    addMap : function(defaultProperties) {

    },

    getProperties:function() {
        var stylerProperties = {};

        // update ui property
        stylerProperties.ui = {
            icon: {}
        };

        var dsIdsArray = [];

        for (var key in this.options.datasources) {
            dsIdsArray.push(this.options.datasources[key].id);
        }


        if (!isUndefinedOrNull(this.properties.fixed)) {
            OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed");

            // DEFAULT ICON
            stylerProperties.ui.icon.fixed = {};

            var defaultIconProps = OSH.UI.Styler.Factory.getFixedIcon(this.properties.fixed.defaultIcon.arraybuffer);
            OSH.Utils.copyProperties(defaultIconProps,stylerProperties);

            // UI
            stylerProperties.ui.icon.fixed.defaultIcon = this.properties.fixed.defaultIcon;

            // SELECTED ICON
            //TODO: replace selected way
            if(OSH.Utils.hasOwnNestedProperty(this.properties,"fixed.selectedIcon")) {

                OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.defaultIcon.arraybuffer");
                OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.selectedIcon");

                if(!isUndefinedOrNull(this.properties.fixed.selectedIcon)) {

                    var selectedIconProps = OSH.UI.Styler.Factory.getSelectedIconFunc(
                        dsIdsArray,
                        this.properties.fixed.defaultIcon.arraybuffer,
                        this.properties.fixed.selectedIcon.arraybuffer
                    );

                    OSH.Utils.copyProperties(selectedIconProps, stylerProperties);

                    // UI
                    stylerProperties.ui.icon.fixed.selectedIcon = this.properties.fixed.selectedIcon;
                }
            }
        } else if (!isUndefinedOrNull(this.properties.custom)) {
            OSH.Asserts.checkObjectPropertyPath(this.properties,"custom");

            stylerProperties.ui.icon.custom = {};
            var textContent = document.getElementById(this.textareaId).value;

            var iconFuncProps = OSH.UI.Styler.Factory.getCustomIconFunc(
                dsIdsArray, // ds array ids
                textContent //iconFnStr
            );

            OSH.Utils.copyProperties(iconFuncProps,stylerProperties);

            // UI
            stylerProperties.ui.icon.custom = textContent;

        } else if (!isUndefinedOrNull(this.properties.threshold)) {
            stylerProperties.ui.icon.threshold = {};

            OSH.Asserts.checkObjectPropertyPath(this.properties,"threshold");

            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.observableIdx);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.datasourceIdx);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.defaultIcon);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.lowIcon);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.highIcon);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.value);

            //dataSourceIdsArray,datasource, observableIdx,
            //defaultIconArrayBuffer, lowIconArrayBuffer, highIconArrayBuffer, thresholdValue
            var iconFuncProps = OSH.UI.Styler.Factory.getThresholdIcon(
                dsIdsArray,
                this.options.datasources[this.properties.threshold.datasourceIdx],
                this.properties.threshold.observableIdx,
                this.properties.threshold.defaultIcon.arraybuffer,
                this.properties.threshold.lowIcon.arraybuffer,
                this.properties.threshold.highIcon.arraybuffer,
                this.properties.threshold.value
            );

            OSH.Utils.copyProperties(iconFuncProps,stylerProperties);

            // UI
            stylerProperties.ui.icon.threshold.defaultIcon = this.properties.threshold.defaultIcon;
            stylerProperties.ui.icon.threshold.lowIcon = this.properties.threshold.lowIcon;
            stylerProperties.ui.icon.threshold.highIcon = this.properties.threshold.highIcon;
            stylerProperties.ui.icon.threshold.value = this.properties.threshold.value;
            stylerProperties.ui.icon.threshold.observableIdx = this.properties.threshold.observableIdx;
            stylerProperties.ui.icon.threshold.datasourceIdx = this.properties.threshold.datasourceIdx;
        }
        return stylerProperties;
    }
});