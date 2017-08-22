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

        this.content = document.createElement("div");
        this.div.appendChild(this.content);

        this.properties = {};

        this.properties = {
            datasource:null,
            default:{
                x:0.0,
                y:0.0,
                z:0.0
            },
            mappingIdx: {
                x:null,
                y:null,
                z:null
            }
        };

        OSH.Utils.addHTMLTitledLine(this.content,"Default location");

        this.xDefaultInputId = OSH.Utils.addInputText(this.content, "X", "0.0");
        this.yDefaultInputId = OSH.Utils.addInputText(this.content, "Y", "0.0");
        this.zDefaultInputId = OSH.Utils.addInputText(this.content, "Z", "0.0");

        OSH.Utils.addHTMLTitledLine(this.content,"Mapping");

        // data source
        var dsName = [];
        for(var i=0;i < this.options.datasources.length;i++) {
            dsName.push(this.options.datasources[i].name);
        }

        var dsListBoxId = OSH.Utils.addHTMLListBox(this.content, "Data Source", dsName);

        this.xInputMappingId = OSH.Utils.addHTMLListBox(this.content, "X", []);
        this.yInputMappingId = OSH.Utils.addHTMLListBox(this.content, "Y", []);
        this.zInputMappingId = OSH.Utils.addHTMLListBox(this.content, "Z", []);


        // adds default values
        if(this.options.datasources.length > 0) {
            this.properties.datasource = this.options.datasources[0];

            // updates observables { x,y,z} listbox
            var observables = self.getObservable(dsListBoxId);
            this.loadMapLocation(observables,this.xInputMappingId,this.yInputMappingId,this.zInputMappingId);
        }

        // adds listeners
        this.addListener(document.getElementById(dsListBoxId), "change", function () {
            self.properties.datasource = this.options[this.selectedIndex].value;

            // updates observables { x,y,z} listbox
            var observables = self.getObservable(dsListBoxId);
            self.loadMapLocation(observables,self.xInputMappingId,self.yInputMappingId,self.zInputMappingId);
        });

        // load existing values if any
        if(!isUndefinedOrNull(this.options.styler) && !isUndefinedOrNull(this.options.styler.location)) {
                document.getElementById(this.xDefaultInputId).value = this.options.styler.location.x;
                document.getElementById(this.yDefaultInputId).value = this.options.styler.location.y;
                document.getElementById(this.zDefaultInputId).value = this.options.styler.location.z;

                //if(!isUndefined(this.options.styler.location.mappingIdx)) {

                //}
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

    getProperties:function() {

        this.properties.default = {
            x:document.getElementById(this.xDefaultInputId).value,
            y:document.getElementById(this.yDefaultInputId).value,
            z:document.getElementById(this.zDefaultInputId).value
        };

        this.properties.mappingIdx = {
            x:document.getElementById(this.xInputMappingId).selectedIndex,
            y:document.getElementById(this.yInputMappingId).selectedIndex,
            z:document.getElementById(this.zInputMappingId).selectedIndex
        };

        return this.properties;
    }
});