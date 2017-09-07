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

        if(!isUndefinedOrNull(this.styler.ui)) {
            if (!isUndefinedOrNull(this.styler.ui.icon)) {
                if (!isUndefinedOrNull(this.styler.ui.icon.fixed)) {
                    // loads fixed
                    typeInputElt.options.selectedIndex = 1;
                    this.addFixed(this.styler.ui.icon.fixed);
                } else if (!isUndefinedOrNull(this.styler.ui.icon.threshold)) {
                    typeInputElt.options.selectedIndex = 2;
                    this.addThreshold(this.styler.ui.icon);
                } else if (!isUndefinedOrNull(this.styler.ui.icon.custom)) {
                    typeInputElt.options.selectedIndex = 4;
                    this.addCustom(this.styler.ui.icon);
                }

                this.properties = this.styler.ui.icon;
            }
        } else if(!isUndefinedOrNull(this.styler.properties) && !isUndefinedOrNull(this.styler.properties.iconFunc)) {
            typeInputElt.options.selectedIndex = 4;
            this.addCustom({custom :{iconFuncStr:this.styler.properties.iconFunc.handler.toSource()}});
        }
    },

    removeProps:function() {
        delete this.properties.fixed;
        delete this.properties.threshold;
    },

    addNone:function() {},

    addFixed : function(defaultProperties) {

        this.properties.fixed = {
            defaultIcon: null,
            selectedIcon:null
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

        this.addListener(selectedIconInputElt, "change", this.inputFileHandler.bind(selectedIconInputElt,function(result) {
            self.properties.fixed.selectedIcon = result;
        }));

        // edit values
        if(!isUndefinedOrNull(defaultProperties)){
            this.setInputFileValue(defaultIconInputElt,defaultProperties.defaultIcon);
            this.setInputFileValue(selectedIconInputElt,defaultProperties.selectedIcon);
        }
    },

    addThreshold:function(defaultProperties) {

        this.properties.threshold = {
             lowIcon:null,
             highIcon:null,
             defaultIcon:null,
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

        this.loadObservable(dsListBoxId,observableListBoxId,thresholdInputId);
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
            this.setInputFileValue(lowIconInputElt,defaultProperties.threshold.lowIcon);
            this.setInputFileValue(highIconInputElt,defaultProperties.threshold.highIcon);
            document.getElementById(thresholdInputId).value = defaultProperties.threshold.value;
        }
    },

    addCustom:function(properties) {
        var defaultValue = "";
        if(!isUndefinedOrNull(properties)) {
            defaultValue = properties.custom.iconFuncStr;
        }
        this.textareaId = OSH.Utils.addHTMLTextArea(this.content, defaultValue);
    },

    getProperties:function() {
        var stylerProperties = {};

        if(!isUndefinedOrNull(this.properties.fixed)) {
            // save ui properties
            if(isUndefinedOrNull(this.styler.ui)) {
                this.styler.ui = {};
            }

            this.styler.ui.icon = {
                fixed: {}
            };

            if(!isUndefinedOrNull(this.properties.fixed.defaultIcon)) {
                var defaultIconProps = OSH.UI.Styler.Factory.getFixedIcon(this.properties.fixed.defaultIcon.arraybuffer);

                OSH.Utils.copyProperties(defaultIconProps,stylerProperties);

                // save ui properties
                this.styler.ui.icon.fixed.defaultIcon = this.properties.fixed.defaultIcon;
            }

            if(!isUndefinedOrNull(this.properties.fixed.selectedIcon)) {
                //TODO: var ds = datasources[properties.location.datasourceIdx];
                var dsIdsArray = [];

                for(var key in this.options.datasources) {
                    dsIdsArray.push(this.options.datasources[key].id);
                }

                var selectedIconProps = OSH.UI.Styler.Factory.getSelectedIconFunc(
                    dsIdsArray,
                    this.properties.fixed.defaultIcon.arraybuffer,
                    this.properties.fixed.selectedIcon.arraybuffer
                );

                OSH.Utils.copyProperties(selectedIconProps,stylerProperties);

                // save ui properties
                this.styler.ui.icon.fixed.selectedIcon = this.properties.fixed.selectedIcon;
            }
        }

        return stylerProperties;
    }
});