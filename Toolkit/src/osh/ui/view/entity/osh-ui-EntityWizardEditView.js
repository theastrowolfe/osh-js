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

OSH.UI.EntityWizardEditView = OSH.UI.View.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, [], properties);

        // add template
        var editView = document.createElement("div");
        editView.setAttribute("id","Edit-view-"+OSH.Utils.randomUUID());
        editView.setAttribute("class",'edit-view');

        document.getElementById(this.divId).appendChild(editView);

        this.dialogOptionId = OSH.Utils.randomUUID();

        var strVar="";
        strVar += OSH.Utils.createHTMLTitledLine("Container");
        strVar += "<ul>";
        strVar += "  <li>";
        strVar += "    <label for=\"dialog\">Dialog:<\/label>";
        strVar += "    <input id=\""+this.dialogOptionId+"\"  class=\"input-checkbox\" type=\"checkbox\" name=\"dialog\" />";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        strVar += OSH.Utils.createHTMLTitledLine("Styler");

        editView.innerHTML = strVar;
    }
});