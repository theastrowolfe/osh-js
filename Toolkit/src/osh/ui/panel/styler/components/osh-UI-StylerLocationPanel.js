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

OSH.UI.Panel.LocationPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        var self = this;

        this.contentElt = document.createElement("div");
        this.divElt.appendChild(this.contentElt);

        OSH.Utils.addHTMLTitledLine(this.contentElt,"Default location");


        var xDefaultValue = "0.0";
        var yDefaultValue = "0.0";
        var zDefaultValue = "0.0";

        // inits default values
        if(!isUndefinedOrNull(this.styler.ui) && !isUndefinedOrNull(this.styler.ui.location)) {

            // default location
            if (!isUndefinedOrNull(this.styler.ui.location.default)) {
                xDefaultValue = this.styler.ui.location.default.x;
                yDefaultValue = this.styler.ui.location.default.y;
                zDefaultValue = this.styler.ui.location.default.z;
            }
        }

        this.xDefaultInputId = OSH.Utils.addInputText(this.contentElt, "X", "",xDefaultValue);
        this.yDefaultInputId = OSH.Utils.addInputText(this.contentElt, "Y", "",yDefaultValue);
        this.zDefaultInputId = OSH.Utils.addInputText(this.contentElt, "Z", "",zDefaultValue);

        OSH.Utils.addHTMLTitledLine(this.contentElt,"Mapping");

        // load existing values if any
        // load UI settings
        if((!isUndefinedOrNull(this.styler.ui) &&
            !isUndefinedOrNull(this.styler.ui.location) &&
            !isUndefinedOrNull(this.styler.ui.location.locationFunc)) ||
            isUndefinedOrNull(this.styler.properties.locationFunc)) {
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
        this.dsListBoxId     = OSH.Utils.addHTMLListBox(this.contentElt, "Data Source", dsName);
        this.xInputMappingId = OSH.Utils.addHTMLListBox(this.contentElt, "X", []);
        this.yInputMappingId = OSH.Utils.addHTMLListBox(this.contentElt, "Y", []);
        this.zInputMappingId = OSH.Utils.addHTMLListBox(this.contentElt, "Z", []);

        var self = this;

        // adds default values
        if(!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {

            // updates observables { x,y,z} listbox
            var observables = self.getObservable(this.dsListBoxId);
            this.loadMapLocation(observables,this.xInputMappingId,this.yInputMappingId,this.zInputMappingId);

            if(!isUndefinedOrNull(this.styler.ui) && !isUndefinedOrNull(this.styler.ui.location)) {

                // location function
                if(!isUndefinedOrNull(this.styler.ui.location.locationFunc)) {
                    document.getElementById(this.xInputMappingId).options.selectedIndex = this.styler.ui.location.locationFunc.x;
                    document.getElementById(this.yInputMappingId).options.selectedIndex = this.styler.ui.location.locationFunc.y;
                    document.getElementById(this.zInputMappingId).options.selectedIndex = this.styler.ui.location.locationFunc.z;
                }
            }
        }
    },

    loadMapLocation:function(observableArr,xInputMappingId,yInputMappingId,zInputMappingId) {
        var xInputTag = document.getElementById(xInputMappingId);
        var yInputTag = document.getElementById(yInputMappingId);
        var zInputTag = document.getElementById(zInputMappingId);

        OSH.Utils.removeAllFromSelect(xInputMappingId);
        OSH.Utils.removeAllFromSelect(yInputMappingId);
        OSH.Utils.removeAllFromSelect(zInputMappingId);

        if(!isUndefinedOrNull(observableArr)) {
            for (var i=0;i < observableArr.length;i++) {

                // x
                var option = document.createElement("option");
                option.text = observableArr[i].uiLabel;
                option.value = observableArr[i].uiLabel;
                option.object = observableArr[i].object;

                xInputTag.add(option);

                // y
                option = document.createElement("option");
                option.text = observableArr[i].uiLabel;
                option.value = observableArr[i].uiLabel;
                option.object = observableArr[i].object;

                yInputTag.add(option);

                // z
                option = document.createElement("option");
                option.text = observableArr[i].uiLabel;
                option.value = observableArr[i].uiLabel;
                option.object = observableArr[i].object;

                zInputTag.add(option);
            }
        }
    },

    initCustomFunctionUI:function() {
        this.textareaId = OSH.Utils.createJSEditor(this.contentElt,this.styler.properties.locationFunc.handler.toSource());
    },

    getProperties:function() {
        var stylerProperties = {};

        var locationProps = OSH.UI.Styler.Factory.getLocation(
            Number(document.getElementById(this.xDefaultInputId).value),
            Number(document.getElementById(this.yDefaultInputId).value),
            Number(document.getElementById(this.zDefaultInputId).value)
        );


        OSH.Utils.copyProperties(locationProps, stylerProperties);

        var locationFuncProps;

        if(OSH.Utils.hasOwnNestedProperty(this.styler,"ui.location.locationFunc")){
            if (!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {
                var xIdx = document.getElementById(this.xInputMappingId).selectedIndex;
                var yIdx = document.getElementById(this.yInputMappingId).selectedIndex;
                var zIdx = document.getElementById(this.zInputMappingId).selectedIndex;

                locationFuncProps = OSH.UI.Styler.Factory.getLocationFunc(
                    this.options.datasources[document.getElementById(this.dsListBoxId).selectedIndex], //datasource
                    xIdx, yIdx, zIdx);

                // update ui property
                if (isUndefinedOrNull(this.styler.ui)) {
                    this.styler.ui = {
                        location: {}
                    };
                }

                if (isUndefinedOrNull(this.styler.ui.location)) {
                    this.styler.ui.location = {};
                }

                this.styler.ui.location.locationFunc = {
                    x: xIdx,
                    y: yIdx,
                    z: zIdx
                };
            }
        } else if(OSH.Utils.hasOwnNestedProperty(this.styler,"properties.locationFunc.dataSourceIds")) {
            locationFuncProps = OSH.UI.Styler.Factory.getCustomLocationFunc(
                this.styler.properties.locationFunc.dataSourceIds, //datasource array
                document.getElementById(this.textareaId).value //locationFnStr
            );
        }

        if (!isUndefinedOrNull(locationFuncProps)) {
            OSH.Utils.copyProperties(locationFuncProps, stylerProperties);
        }

        // update ui property
        if (isUndefinedOrNull(this.styler.ui)) {

            this.styler.ui = {
                location: {}
            };
        }

        console.log(this.styler.ui);
        this.styler.ui.location.default = {
            x: document.getElementById(this.xDefaultInputId).value,
            y: document.getElementById(this.yDefaultInputId).value,
            z: document.getElementById(this.zDefaultInputId).value
        };

        return stylerProperties;
    }
});