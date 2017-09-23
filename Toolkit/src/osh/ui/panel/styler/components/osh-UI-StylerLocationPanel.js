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

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Default location");


        var xDefaultValue = "";
        var yDefaultValue = "";
        var zDefaultValue = "";

        // inits default values
        if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.location.default")) {
            // default location
            xDefaultValue = this.styler.ui.location.default.x;
            yDefaultValue = this.styler.ui.location.default.y;
            zDefaultValue = this.styler.ui.location.default.z;
        }

        this.xDefaultInputId = OSH.Helper.HtmlHelper.addInputText(this.contentElt, "X", xDefaultValue,"0.0");
        this.yDefaultInputId = OSH.Helper.HtmlHelper.addInputText(this.contentElt, "Y", yDefaultValue,"0.0");
        this.zDefaultInputId = OSH.Helper.HtmlHelper.addInputText(this.contentElt, "Z", zDefaultValue,"0.0");

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Mapping");

        // load existing values if any
        // load UI settings

        if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.location.locationFuncMapping") ||
            !OSH.Utils.hasOwnNestedProperty(this.styler, "properties.locationFunc")) {
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
        this.zInputMappingId = OSH.Helper.HtmlHelper.addHTMLListBox(this.contentElt, "Z", []);

        var self = this;

        // adds default values
        if(!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {

            // updates observables { x,y,z} listbox
            var observables = self.getObservable(this.dsListBoxId);
            this.loadMapLocation(observables,this.xInputMappingId,this.yInputMappingId,this.zInputMappingId);

            if(OSH.Utils.hasOwnNestedProperty(this.styler, "ui.location.locationFuncMapping")) {
                document.getElementById(this.xInputMappingId).options.selectedIndex = this.styler.ui.location.locationFuncMapping.x;
                document.getElementById(this.yInputMappingId).options.selectedIndex = this.styler.ui.location.locationFuncMapping.y;
                document.getElementById(this.zInputMappingId).options.selectedIndex = this.styler.ui.location.locationFuncMapping.z;
        }
        }
    },

    loadMapLocation:function(observableArr,xInputMappingId,yInputMappingId,zInputMappingId) {
        var xInputTag = document.getElementById(xInputMappingId);
        var yInputTag = document.getElementById(yInputMappingId);
        var zInputTag = document.getElementById(zInputMappingId);

        OSH.Helper.HtmlHelper.removeAllFromSelect(xInputMappingId);
        OSH.Helper.HtmlHelper.removeAllFromSelect(yInputMappingId);
        OSH.Helper.HtmlHelper.removeAllFromSelect(zInputMappingId);

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

    /**
     * Returns the properties as JSON object.
     *
     * @return {
     *  ui : {
     *      location : {
     *      }
     *  },
     *
     *  location : {...}, // if any
     *
     *  locationFunc: {...} // if any
     * }
     */
    getProperties:function() {
        var stylerProperties = {};

        var locationFuncProps,  defaultLocationProps;

        // update ui property
        stylerProperties.ui = {
            location:{}
        };

        // default location x,y,z
        defaultLocationProps = OSH.UI.Styler.Factory.getLocation(
            Number(document.getElementById(this.xDefaultInputId).value),
            Number(document.getElementById(this.yDefaultInputId).value),
            Number(document.getElementById(this.zDefaultInputId).value)
        );

        // update ui property
        stylerProperties.ui.location.default = {
            x: Number(document.getElementById(this.xDefaultInputId).value),
            y: Number(document.getElementById(this.yDefaultInputId).value),
            z: Number(document.getElementById(this.zDefaultInputId).value)
        };

        // mapping function with data
        if(isUndefinedOrNull(this.textareaId)) {
            var xIdx=0,yIdx=0,zIdx=0;

            if (!isUndefinedOrNull(this.options.datasources) && this.options.datasources.length > 0) {
                xIdx = document.getElementById(this.xInputMappingId).selectedIndex;
                yIdx = document.getElementById(this.yInputMappingId).selectedIndex;
                zIdx = document.getElementById(this.zInputMappingId).selectedIndex;

                locationFuncProps = OSH.UI.Styler.Factory.getLocationFunc(
                    this.options.datasources[document.getElementById(this.dsListBoxId).selectedIndex], //datasource
                    xIdx, yIdx, zIdx); // obs indexes
            }

            stylerProperties.ui.location.locationFuncMapping = {
                x: xIdx,
                y: yIdx,
                z: zIdx
            };
        } else {
            // custom textual function
            var textContent = document.getElementById(this.textareaId).value;

            locationFuncProps = OSH.UI.Styler.Factory.getCustomLocationFunc(
                this.styler, //datasource array
                document.getElementById(this.textareaId).value //locationFnStr
            );

            stylerProperties.ui.location.custom = textContent;
        }


        // copy default location properties
        OSH.Utils.copyProperties(defaultLocationProps, stylerProperties);

        // copy location function properties if any
        if (!isUndefinedOrNull(locationFuncProps)) {
            OSH.Utils.copyProperties(locationFuncProps, stylerProperties);
        }

        return stylerProperties;
    }
});