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
        this.typeInputId = OSH.Helper.HtmlHelper.addHTMLListBox(this.divElt,"Icon type", [
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
            OSH.Helper.HtmlHelper.removeAllNodes(self.content);
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
                default: null,
                selected: null
            }
        };

        // low icon
        this.defaultIconInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content,"Default icon",true);

        // default icon
        var defaultIconInputElt = document.getElementById(this.defaultIconInputId);

        // selected icon
        var selectedIconInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "Selected icon",true);

        var selectedIconInputElt = document.getElementById(selectedIconInputId);

        var self = this;

        this.addListener(defaultIconInputElt, "change", this.inputFileHandlerAsBinaryString.bind(defaultIconInputElt,function(result) {
            self.properties.fixed.default = result;
        }));

        this.addListener(defaultIconInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(defaultIconInputElt.nextElementSibling,function(result) {
            self.properties.fixed.default = result;
        }));

        this.addListener(selectedIconInputElt, "change", this.inputFileHandlerAsBinaryString.bind(selectedIconInputElt,function(result) {
            self.properties.fixed.selected = result;
        }));

        this.addListener(selectedIconInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(selectedIconInputElt.nextElementSibling,function(result) {
            self.properties.fixed.selected = result;
        }));

        // edit values
        if(!isUndefinedOrNull(defaultProperties)){
            this.setInputFileValue(defaultIconInputElt,defaultProperties.default);
            this.setInputFileValue(selectedIconInputElt,defaultProperties.selected);

            this.properties.fixed.default = defaultProperties.default;
            this.properties.fixed.selected = defaultProperties.selected;
        }
    },

    addThreshold:function(defaultProperties) {

        this.properties = {
            threshold : {
                low: null,
                high: null,
                default: null,
                datasourceIdx: null,
                observableIdx: null
            }
        };

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.content,"Data source");


        if(this.options.datasources.length > 0) {
            this.properties.threshold.datasourceIdx = 0;
        }

        var dsListBoxId = OSH.Helper.HtmlHelper.addHTMLObjectWithLabelListBox(this.content, "Data Source", this.options.datasources);
        var observableListBoxId = OSH.Helper.HtmlHelper.addHTMLListBox(this.content, "Observable", []);

        // default
        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.content,"Default");
        var defaultIconInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "Default icon",true);

        // threshold
        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.content,"Threshold");

        // low icon
        var lowIconInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "Low icon",true);

        // high icon
        var highIconInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "High icon",true);

        // threshold
        var thresholdInputId = OSH.Helper.HtmlHelper.addInputTextValueWithUOM(this.content, "Threshold value", "12.0","");

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
        this.addListener(defaultIconInputElt, "change", this.inputFileHandlerAsBinaryString.bind(defaultIconInputElt,function(result) {
            self.properties.threshold.default = result;
        }));

        this.addListener(defaultIconInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(defaultIconInputElt.nextElementSibling,function(result) {
            self.properties.threshold.default = result;
        }));

        var lowIconInputElt = document.getElementById(lowIconInputId);
        this.addListener(lowIconInputElt, "change", this.inputFileHandlerAsBinaryString.bind(lowIconInputElt,function(result) {
            self.properties.threshold.low = result;
        }));

        this.addListener(lowIconInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(lowIconInputElt.nextElementSibling,function(result) {
            self.properties.threshold.low = result;
        }));

        var highIconInputElt = document.getElementById(highIconInputId);
        this.addListener(highIconInputElt, "change", this.inputFileHandlerAsBinaryString.bind(highIconInputElt,function(result) {
            self.properties.threshold.high = result;
        }));

        this.addListener(highIconInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(highIconInputElt.nextElementSibling,function(result) {
            self.properties.threshold.high = result;
        }));

        this.addListener(document.getElementById(thresholdInputId), "change", function () {
            self.properties.threshold.value = this.value;
        });

        // edit values
        if(!isUndefinedOrNull(defaultProperties)) {
            this.setInputFileValue(defaultIconInputElt,defaultProperties.default);
            this.setInputFileValue(lowIconInputElt,defaultProperties.low);
            this.setInputFileValue(highIconInputElt,defaultProperties.high);
            document.getElementById(thresholdInputId).value = defaultProperties.value;

            this.properties.threshold.default = defaultProperties.default;
            this.properties.threshold.low = defaultProperties.low;
            this.properties.threshold.high = defaultProperties.high;
            this.properties.threshold.value = defaultProperties.value;

            var dsSelectTag = document.getElementById(dsListBoxId);

            for(var i=0; i < dsSelectTag.options.length;i++) {
                var currentOption = dsSelectTag.options[i];

                if(currentOption.object.id === defaultProperties.datasourceId) {
                    currentOption.setAttribute("selected","");
                    this.properties.threshold.datasourceIdx = i;
                    break;
                }
            }

            this.loadObservable(dsListBoxId,observableListBoxId,thresholdInputId);

            var obsSelectTag = document.getElementById(observableListBoxId);
            obsSelectTag.options[defaultProperties.observableIdx].setAttribute("selected","");

            this.properties.threshold.observableIdx = defaultProperties.observableIdx
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

            OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.default.url");

            var defaultIconProps = OSH.UI.Styler.Factory.getFixedIcon(dsIdsArray,this.properties.fixed.default.url);

            OSH.Utils.copyProperties(defaultIconProps,stylerProperties);

            // UI
            stylerProperties.ui.icon.fixed.default = this.properties.fixed.default;

            // SELECTED ICON
            //TODO: replace selected way
            if(OSH.Utils.hasOwnNestedProperty(this.properties,"fixed.selected")) {

                OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.selected");

                if(!isUndefinedOrNull(this.properties.fixed.selected)) {

                    var selectedIconProps = OSH.UI.Styler.Factory.getSelectedIconFunc(
                        dsIdsArray,
                        this.properties.fixed.default.url,
                        this.properties.fixed.selected.url
                    );

                    console.log(selectedIconProps.iconFunc.handler.toSource());
                    OSH.Utils.copyProperties(selectedIconProps, stylerProperties);

                    // UI
                    stylerProperties.ui.icon.fixed.selected = this.properties.fixed.selected;
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
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.default);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.low);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.high);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.value);

            //dataSourceIdsArray,datasource, observableIdx,
            //defaultIconArrayBuffer, lowIconArrayBuffer, highIconArrayBuffer, thresholdValue
            var currentDatasource = this.options.datasources[this.properties.threshold.datasourceIdx];

            var iconFuncProps = OSH.UI.Styler.Factory.getThresholdIcon(
                currentDatasource,
                this.properties.threshold.observableIdx,
                this.properties.threshold.default.url,
                this.properties.threshold.low.url,
                this.properties.threshold.high.url,
                this.properties.threshold.value
            );

            OSH.Utils.copyProperties(iconFuncProps,stylerProperties);

            // UI
            stylerProperties.ui.icon.threshold.default = this.properties.threshold.default;
            stylerProperties.ui.icon.threshold.low = this.properties.threshold.low;
            stylerProperties.ui.icon.threshold.high = this.properties.threshold.high;
            stylerProperties.ui.icon.threshold.value = this.properties.threshold.value;
            stylerProperties.ui.icon.threshold.observableIdx = this.properties.threshold.observableIdx;
            stylerProperties.ui.icon.threshold.datasourceId = currentDatasource.id;
        } else {
            delete stylerProperties.icon; // remove icon properties from result
        }
        return stylerProperties;
    }
});