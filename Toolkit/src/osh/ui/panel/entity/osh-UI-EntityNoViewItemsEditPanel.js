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

OSH.UI.EntityNoViewItemsEditPanel = OSH.UI.EntityEditViewPanel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    buildContent:function() {
        this.buildDataSource(this.options.datasources);
    },

    buildDataSource: function(datasourceArr) {
        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.divElt,"Data Sources");
        var dataSourceId = OSH.Helper.HtmlHelper.addHTMLListBox(this.divElt,"",[]);
        var selectTag = document.getElementById(dataSourceId);

        for(var key in datasourceArr) {

            var option = document.createElement("option");
            option.text = datasourceArr[key].name;
            option.value = datasourceArr[key].name;
            option.obj = datasourceArr[key];

            if(this.view.datasource !== null && datasourceArr[key].id === this.view.datasource.id) {
                option.setAttribute("selected","");
            }
            selectTag.add(option);
        }

        if(this.view.datasource === null && datasourceArr.length > 0) {
            this.view.datasource  = datasourceArr[0]; // default select the first one
        }

        // listener
        var self = this;

        OSH.EventManager.observeDiv(dataSourceId,"change",function(event) {
            self.view.datasource = this.options[this.selectedIndex].obj;
        });
    }
});
