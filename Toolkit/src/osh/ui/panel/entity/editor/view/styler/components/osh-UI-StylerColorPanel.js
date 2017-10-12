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

OSH.UI.Panel.ColorPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        // type
        this.typeInputId = OSH.Helper.HtmlHelper.addHTMLListBox(this.divElt,"Color type", [
            "None",
            "Fixed",
            "Threshold"
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

        //-- sets color type
        var typeInputElt = document.getElementById(this.typeInputId);

        if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.color")) {
            if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.color.fixed")) {
                // loads fixed
                typeInputElt.options.selectedIndex = 1;
                this.addFixed(this.styler.properties.ui.color.fixed);
            } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.color.threshold")) {
                // loads threshold
                typeInputElt.options.selectedIndex = 2;
                this.addThreshold(this.styler.properties.ui.color.threshold);
            } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.color.map")) {
                // loads map
                typeInputElt.options.selectedIndex = 3;
                this.addMap(this.styler.properties.ui.color.map);
            } else if (OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.color.custom")) {
                // loads custom
                typeInputElt.options.selectedIndex = 4;
                this.addCustom(this.styler.properties.ui.color.custom);
            }
        } else if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.colorFunc")) {
            typeInputElt.options.selectedIndex = 4;
            this.addCustom(this.styler.properties.colorFunc.handler.toSource());
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

        this.defaultColorInputId = OSH.Helper.HtmlHelper.addColorPicker(this.content,"Default color","#1f77b5","color");

        this.selectedColorInputId = OSH.Helper.HtmlHelper.addColorPicker(this.content,"Selected color","#1f77b5","color");

        // edit values
        OSH.Helper.HtmlHelper.onDomReady(function(){
            if(!isUndefinedOrNull(defaultProperties)){
                if(!isUndefinedOrNull(defaultProperties.default)) {
                    var defaultColorInputElt = document.getElementById(this.defaultColorInputId);
                    var defaultColorPickerElt = defaultColorInputElt.nextElementSibling;

                    defaultColorPickerElt.value = defaultProperties.default;
                    defaultColorPickerElt.select();

                    defaultColorInputElt.value = defaultProperties.default;
                    defaultColorInputElt.innerHTML = defaultProperties.default;

                    this.properties.fixed.default = defaultProperties.default;
                }
                if(!isUndefinedOrNull(defaultProperties.selected)) {
                    var selectedColorInputElt = document.getElementById(this.selectedColorInputId);
                    var selectedColorPickerElt = document.getElementById(this.selectedColorInputId).nextElementSibling;

                    selectedColorPickerElt.value = defaultProperties.selected;
                    selectedColorPickerElt.select();

                    selectedColorInputElt.value = defaultProperties.selected;
                    selectedColorInputElt.innerHTML = defaultProperties.selected;

                    this.properties.fixed.selected = defaultProperties.selected;
                }
            }
        }.bind(this));
    },

    addThreshold:function(defaultProperties) {

        this.properties = {
            threshold : {
                low: null,
                high: null,
                default: null,
                datasourceId: null,
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
        var defaultColorInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "Default color",true);

        // threshold
        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.content,"Threshold");

        // low color
        var lowColorInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "Low color",true);

        // high color
        var highColorInputId = OSH.Helper.HtmlHelper.addTitledFileChooser(this.content, "High color",true);

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

        var defaultColorInputElt = document.getElementById(defaultColorInputId);
        this.addListener(defaultColorInputElt, "change", this.inputFileHandlerAsBinaryString.bind(defaultColorInputElt,function(result) {
            self.properties.threshold.default = result;
        }));

        this.addListener(defaultColorInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(defaultColorInputElt.nextElementSibling,function(result) {
            self.properties.threshold.default = result;
        }));

        var lowColorInputElt = document.getElementById(lowColorInputId);
        this.addListener(lowColorInputElt, "change", this.inputFileHandlerAsBinaryString.bind(lowColorInputElt,function(result) {
            self.properties.threshold.low = result;
        }));

        this.addListener(lowColorInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(lowColorInputElt.nextElementSibling,function(result) {
            self.properties.threshold.low = result;
        }));

        var highColorInputElt = document.getElementById(highColorInputId);
        this.addListener(highColorInputElt, "change", this.inputFileHandlerAsBinaryString.bind(highColorInputElt,function(result) {
            self.properties.threshold.high = result;
        }));

        this.addListener(highColorInputElt.nextElementSibling, "paste", this.inputFilePasteHandler.bind(highColorInputElt.nextElementSibling,function(result) {
            self.properties.threshold.high = result;
        }));

        this.addListener(document.getElementById(thresholdInputId), "change", function () {
            self.properties.threshold.value = this.value;
        });

        // edit values
        if(!isUndefinedOrNull(defaultProperties)) {
            this.setInputFileValue(defaultColorInputElt,defaultProperties.default);
            this.setInputFileValue(lowColorInputElt,defaultProperties.low);
            this.setInputFileValue(highColorInputElt,defaultProperties.high);
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

            this.properties.threshold.observableIdx = defaultProperties.observableIdx;
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
        var stylerProperties = {
            properties: {
                ui: {
                    color: {}
                }
            }
        };

        var dsIdsArray = [];

        for (var key in this.options.datasources) {
            dsIdsArray.push(this.options.datasources[key].id);
        }

        if (!isUndefinedOrNull(this.properties.fixed)) {
            OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed");

            // DEFAULT color
            stylerProperties.properties.ui.color.fixed = {};

            OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.default");

            var defaultColor = document.getElementById(this.defaultColorInputId).value;

            var defaultColorProps = OSH.UI.Styler.Factory.getFixedColor(dsIdsArray,defaultColor);

            OSH.Utils.copyProperties(defaultColorProps,stylerProperties.properties);

            stylerProperties.properties.color = defaultColorProps.color;

            // UI
            stylerProperties.properties.ui.color.fixed.default = defaultColor;

            // SELECTED Color
            //TODO: replace selected way
            if(OSH.Utils.hasOwnNestedProperty(this.properties,"fixed.selected")) {

                OSH.Asserts.checkObjectPropertyPath(this.properties,"fixed.selected");

                var selectedColor = document.getElementById(this.selectedColorInputId).value;

                if(!isUndefinedOrNull(selectedColor)) {

                    var selectedColorProps = OSH.UI.Styler.Factory.getSelectedColorFunc(
                        dsIdsArray,
                        defaultColor,
                        selectedColor
                    );

                    OSH.Utils.copyProperties(selectedColorProps, stylerProperties.properties);

                    stylerProperties.properties.color = selectedColorProps.color;

                    // UI
                    stylerProperties.properties.ui.color.fixed.selected = selectedColor;
                }
            }
        } else if (!isUndefinedOrNull(this.properties.custom)) {
            OSH.Asserts.checkObjectPropertyPath(this.properties,"custom");

            stylerProperties.properties.ui.color.custom = {};
            var textContent = document.getElementById(this.textareaId).value;

            var colorFuncProps = OSH.UI.Styler.Factory.getCustomColorFunc(
                dsIdsArray, // ds array ids
                textContent //colorFnStr
            );

            OSH.Utils.copyProperties(colorFuncProps,stylerProperties.properties);

            // UI
            stylerProperties.properties.ui.color.custom = textContent;

        } else if (!isUndefinedOrNull(this.properties.threshold)) {
            stylerProperties.properties.ui.color.threshold = {};

            OSH.Asserts.checkObjectPropertyPath(this.properties,"threshold");

            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.observableIdx);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.datasourceIdx);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.default);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.low);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.high);
            OSH.Asserts.checkIsDefineOrNotNull(this.properties.threshold.value);

            //dataSourceIdsArray,datasource, observableIdx,
            //defaultColorArrayBuffer, lowColorArrayBuffer, highColorArrayBuffer, thresholdValue
            var currentDatasource = this.options.datasources[this.properties.threshold.datasourceIdx];

            var colorFuncProps = OSH.UI.Styler.Factory.getThresholdColor(
                currentDatasource,
                this.properties.threshold.observableIdx,
                this.properties.threshold.default,
                this.properties.threshold.low,
                this.properties.threshold.high,
                this.properties.threshold.value
            );

            OSH.Utils.copyProperties(colorFuncProps,stylerProperties.properties);

            stylerProperties.properties.color = colorFuncProps.color;

            // UI
            stylerProperties.properties.ui.color.threshold.default = this.properties.threshold.default;
            stylerProperties.properties.ui.color.threshold.low = this.properties.threshold.low;
            stylerProperties.properties.ui.color.threshold.high = this.properties.threshold.high;
            stylerProperties.properties.ui.color.threshold.value = this.properties.threshold.value;
            stylerProperties.properties.ui.color.threshold.observableIdx = this.properties.threshold.observableIdx;
            stylerProperties.properties.ui.color.threshold.datasourceId = currentDatasource.id;
        } else {
            delete stylerProperties.properties.color; // remove color properties from result
        }
        return stylerProperties;
    }
});