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

OSH.UI.Panel.VideoPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        var self = this;

        this.contentElt = document.createElement("div");
        this.divElt.appendChild(this.contentElt);


        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Mapping");

        // load existing values if any
        // load UI settings

        var hasUIProps = OSH.Utils.hasOwnNestedProperty(this.styler, "properties.ui.video");
        if(hasUIProps ||
            !OSH.Utils.hasOwnNestedProperty(this.styler, "properties.frameFunc")) { //TODO: the view should not know about function name "frameFunc"
            if(hasUIProps){
                this.initMappingFunctionUI(this.styler.properties.ui.video);
            } else {
                this.initMappingFunctionUI();
            }

        } else {
            //this.initCustomFunctionUI();
        }
    },

    initMappingFunctionUI:function(properties) {
        this.properties = {
            frame : {
                datasourceIdx: null,
                observableIdx: null
            }
        };

        // data source
        var dsName = [];

        if (!isUndefinedOrNull(this.options.datasources)) {
            for (var i = 0; i < this.options.datasources.length; i++) {
                dsName.push(this.options.datasources[i].name);
            }
        }

        if(this.options.datasources.length > 0) {
            this.properties.frame.datasourceIdx = 0;
        }

        var dsListBoxId = OSH.Helper.HtmlHelper.addHTMLObjectWithLabelListBox(this.contentElt, "Data Source", this.options.datasources);
        this.observableListBoxId = OSH.Helper.HtmlHelper.addHTMLListBox(this.contentElt, "Observable", []);

        if(!this.loadObservable(dsListBoxId,this.observableListBoxId)) {
            this.properties.frame.observableIdx = 0;
        }

        // edit values
        var self = this;
        if(!isUndefinedOrNull(properties)) {
            OSH.Helper.HtmlHelper.onDomReady(function () {
                var dsTag = document.getElementById(dsListBoxId);

                var idx = -1;
                for(var i=0; i < dsTag.options.length;i++) {
                    if(dsTag.options[i].object.id === properties.datasourceId) {
                        idx = i;
                        break;
                    }
                }
                if(idx > -1) {
                    dsTag.options.selectedIndex = idx;
                    document.getElementById(self.observableListBoxId).options.selectedIndex = properties.observableIdx;
                }
            });
        }
    },

    getProperties:function() {
        var stylerProperties = {
            properties: {
                ui: {
                    video: {}
                }
            }
        };

        var dsIdsArray = [];

        for (var key in this.options.datasources) {
            dsIdsArray.push(this.options.datasources[key].id);
        }

        stylerProperties.properties.ui.video = {};

        OSH.Asserts.checkObjectPropertyPath(this.properties,"frame");
        OSH.Asserts.checkIsDefineOrNotNull(this.properties.frame.observableIdx);
        OSH.Asserts.checkIsDefineOrNotNull(this.properties.frame.datasourceIdx);

        var currentDatasource = this.options.datasources[this.properties.frame.datasourceIdx];


        var observableIdx = document.getElementById(this.observableListBoxId).options.selectedIndex;

        var videoFuncProps = OSH.UI.Styler.Factory.getVideoFunc(
            currentDatasource,
            observableIdx
        );

        // copy function into properties
        OSH.Utils.copyProperties(videoFuncProps,stylerProperties.properties);

        // UI
        stylerProperties.properties.ui.video.observableIdx = observableIdx;
        stylerProperties.properties.ui.video.datasourceId = currentDatasource.id;

        return stylerProperties;
    }

});