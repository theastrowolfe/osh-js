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

OSH.UI.Panel.EntityNoViewItemsEditPanel = OSH.UI.Panel.EntityEditViewPanel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    buildContent:function() {
        this.properties = {};

        var dsArr = [];
        if(!isUndefinedOrNull(this.options.datasources)) {
            dsArr = Object.values(this.options.datasources);
        }
        this.buildDataSource(dsArr);
    },

    buildDataSource: function(datasourceArr) {
        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"Data source");


        if(this.options.datasources.length > 0) {
            this.properties.datasourceIdx = 0;
        } else {
            this.properties.datasourceIdx = -1;
        }

        this.dsListBoxId = OSH.Helper.HtmlHelper.addHTMLObjectWithLabelListBox(this.contentElt, "Data Source", this.options.datasources);

        this.initDefaultData(datasourceArr);
    },

    initDefaultData: function(datasourceArr) {
        // init default datasource if any
        OSH.Asserts.checkIsDefineOrNotNull(this.dsListBoxId);

        if(!isUndefinedOrNull(this.view.dataSourceId)) {
            var idx = -1;
            for(var i=0;i < datasourceArr.length;i++) {
                if(datasourceArr[i].id === this.view.dataSourceId) {
                    idx = i;
                    break;
                }
            }

            if(idx > -1) {
                document.getElementById(this.dsListBoxId).options.selectedIndex = idx;
            }
        }
    },

    getProperties:function() {
        var superProperties = this._super();

        if(this.properties.datasourceIdx >= 0) {
            var listElt = document.getElementById(this.dsListBoxId);
            var selectedOption = listElt.options[listElt.selectedIndex];
            OSH.Utils.copyProperties({
                datasourceId: selectedOption.object.id,
            },superProperties,true);

        }

        return superProperties;
    }
});
