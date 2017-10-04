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

OSH.UI.Panel.XYPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },
    initPanel:function() {
        var self = this;

        this.contentElt = document.createElement("div");
        this.divElt.appendChild(this.contentElt);

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Default values");


        var xDefaultValue = "";
        var yDefaultValue = "";
        var zDefaultValue = "";

        // inits default values
        if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.values.default")) {
            // default values
            xDefaultValue = this.styler.properties.ui.values.default.x;
            yDefaultValue = this.styler.properties.ui.values.default.y;
        }

        this.xDefaultInputId = OSH.Helper.HtmlHelper.addInputText(this.contentElt, "X", xDefaultValue,"0.0");
        this.yDefaultInputId = OSH.Helper.HtmlHelper.addInputText(this.contentElt, "Y", yDefaultValue,"0.0");

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Mapping");

        // load existing values if any
        // load UI settings

        if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.values.valuesFuncMapping") ||
            !OSH.Utils.hasOwnNestedProperty(this.styler, "properties.valuesFunc")) {
            this.initMappingFunctionUI();
        } else {
            this.initCustomFunctionUI();
        }
    },

    initMappingFunctionUI:function() {
        // data source
        var dsName = [];

        if (!isUndefinedOrNull(this.options.datasources)) {
            for (var i = 0; i < this.options.datasources.length; i++) {
                dsName.push(this.options.datasources[i].name);
            }
        }

        // add UIs
        this.dsListBoxId     = OSH.Helper.HtmlHelper.addHTMLListBox(this.contentElt, "Data Source", dsName);
        this.xInputMappingId = OSH.Helper.HtmlHelper.addHTMLListBox(this.contentElt, "X", []);
        this.yInputMappingId = OSH.Helper.HtmlHelper.addHTMLListBox(this.contentElt, "Y", []);

        var self = this;

        // adds default values
        if(!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {

            if(OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.values.valuesFuncMapping")) {
                var datasourceIdx = -1;
                for (var i = 0; i < this.options.datasources.length; i++) {
                    if(this.options.datasources[i].id === this.styler.properties.ui.values.valuesFuncMapping.datasourceId) {
                        datasourceIdx = i;
                        break;
                    }
                }
                if(datasourceIdx > -1) {
                    document.getElementById(this.dsListBoxId).options.selectedIndex = datasourceIdx;

                    this.loadDatasources();

                    document.getElementById(this.xInputMappingId).options.selectedIndex = this.styler.properties.ui.values.valuesFuncMapping.xIdx;
                    document.getElementById(this.yInputMappingId).options.selectedIndex = this.styler.properties.ui.values.valuesFuncMapping.yIdx;
                }
            } else {
                this.loadDatasources();
            }
        }

        this.addListener(document.getElementById(this.dsListBoxId), "change", function () {
            // updates observables { x,y,z} listbox
            var observables = self.getObservable(self.dsListBoxId);
            self.loadMapValues(observables,self.xInputMappingId,self.yInputMappingId);
        });
    },

    loadDatasources:function() {
        // updates observables { x,y,z} listbox
        var observables = this.getObservable(this.dsListBoxId);
        this.loadMapValues(observables,this.xInputMappingId,this.yInputMappingId);
    },

    loadMapValues:function(observableArr,xInputMappingId,yInputMappingId) {
        var xInputTag = document.getElementById(xInputMappingId);
        var yInputTag = document.getElementById(yInputMappingId);

        OSH.Helper.HtmlHelper.removeAllFromSelect(xInputMappingId);
        OSH.Helper.HtmlHelper.removeAllFromSelect(yInputMappingId);

        if(!isUndefinedOrNull(observableArr)) {
            for (var i=0;i < observableArr.length;i++) {

                // x
                var option = document.createElement("option");
                option.text = observableArr[i].uiLabel;
                option.value = observableArr[i].uiLabel;

                xInputTag.add(option);

                // y
                option = document.createElement("option");
                option.text = observableArr[i].uiLabel;
                option.value = observableArr[i].uiLabel;

                yInputTag.add(option);
            }
        }
    },

    initCustomFunctionUI:function() {
        this.textareaId = OSH.Utils.createJSEditor(this.contentElt,this.styler.properties.valuesFunc.handler.toSource());
    },

    /**
     * Returns the properties as JSON object.
     *
     * @example {
     *  ui : {
     *      values : {
     *      }
     *  },
     *
     *  values : {...}, // if any
     *
     *  valuesFunc: {...} // if any
     * }
     */
    getProperties:function() {
        var stylerProperties = {
            properties: {
                ui: {
                    values: {}
                }
            },
            values: {}
        };

        var valuesFuncProps,fixedValuesProps;

        // default values x,y
        fixedValuesProps = OSH.UI.Styler.Factory.getValues(
            Number(document.getElementById(this.xDefaultInputId).value),
            Number(document.getElementById(this.yDefaultInputId).value)
        );

        // update ui property
        stylerProperties.properties.ui.values.default = {
            x: Number(document.getElementById(this.xDefaultInputId).value),
            y: Number(document.getElementById(this.yDefaultInputId).value)
        };

        // mapping function with data
        if(isUndefinedOrNull(this.textareaId)) {
            var xIdx=0,yIdx=0;

            if (!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {
                xIdx = document.getElementById(this.xInputMappingId).selectedIndex;
                yIdx = document.getElementById(this.yInputMappingId).selectedIndex;

                valuesFuncProps = OSH.UI.Styler.Factory.getValuesFunc(
                    this.options.datasources[document.getElementById(this.dsListBoxId).selectedIndex], //datasource
                    xIdx, yIdx); // obs indexes
            }

            stylerProperties.properties.ui.values.valuesFuncMapping = {
                datasourceId: this.options.datasources[document.getElementById(this.dsListBoxId).selectedIndex].id,
                xIdx: xIdx,
                yIdx: yIdx
            };
        } else {
            // custom textual function
            var textContent = document.getElementById(this.textareaId).value;

            valuesFuncProps = OSH.UI.Styler.Factory.getCustomValuesFunc(
                this.styler, //datasource array
                document.getElementById(this.textareaId).value //valuesFnStr
            );

            stylerProperties.properties.ui.values.custom = textContent;
        }


        // copy default values properties
        OSH.Utils.copyProperties(fixedValuesProps, stylerProperties);

        // copy values function properties if any
        if (!isUndefinedOrNull(valuesFuncProps)) {
            OSH.Utils.copyProperties(valuesFuncProps, stylerProperties.properties);
        }

        return stylerProperties;
    }
});