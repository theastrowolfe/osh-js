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

OSH.UI.EntityWizardEditStyler = OSH.UI.View.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, [], properties);
        this.properties = properties;

        // add template
        var editStyler = document.createElement("div");
        editStyler.setAttribute("id","Edit-styler-"+OSH.Utils.randomUUID());
        editStyler.setAttribute("class",'edit-styler');

        document.getElementById(this.divId).appendChild(editStyler);

        var strVar = "";

        strVar += OSH.Utils.createHTMLTitledLine("Data Sources");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";

        // compute DS
        strVar += "<div class=\"listbox-multiple\">";
        for(var i=0;i <properties.datasources.length;i++) {
            var id = properties.datasources[i].id;
            strVar += "<label for=\"edit-view-ds-"+id+"\">"+properties.datasources[i].name+"<\/label>";
            strVar += "<input type=\"checkbox\" name=\"edit-view-ds-"+id+"\" id=\"edit-view-ds-"+id+"\"/><br/>";
        }
        strVar += "<\/div>";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        editStyler.innerHTML = strVar;
    },

    onEdit:function(jsonProperties) {}
});