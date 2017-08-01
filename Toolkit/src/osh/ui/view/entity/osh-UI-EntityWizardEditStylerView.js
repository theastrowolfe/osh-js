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

OSH.UI.EntityWizardEditStylerView = OSH.UI.View.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, [], properties);
        this.properties = properties;

        // add template
        var editStyler = document.createElement("div");
        editStyler.setAttribute("id","Edit-styler-"+OSH.Utils.randomUUID());
        editStyler.setAttribute("class",'edit-styler');

        document.getElementById(this.divId).appendChild(editStyler);

        this.dataSourceId = OSH.Utils.randomUUID();

        var strVar = "";

        strVar += OSH.Utils.createHTMLTitledLine("Data Sources");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";
        strVar += "      <div class=\"select-style\">";
        strVar += "         <select id=\""+this.dataSourceId+"\">";
        strVar += "         <\/select>";
        strVar += "      <\/div>";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        editStyler.innerHTML = strVar;

        // inits
        this.initDatasources(this.properties.datasources);
    },

    initDatasources: function(datasources) {
        var selectTag = document.getElementById(this.dataSourceId);

        for(var key in datasources) {

            var option = document.createElement("option");
            option.text = datasources[key].name;
            option.value = datasources[key].name;

            selectTag.add(option);
        }
    },

    getProperties:function() {
        return {};
    }
});