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

OSH.UI.SaveDialogView = OSH.UI.DialogView.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);

        this.properties = properties;

        // add template
        var saveDialog = document.createElement("div");
        saveDialog.setAttribute("id","Save-dialog-"+OSH.Utils.randomUUID());
        saveDialog.setAttribute("class","save");

        this.footerContent.appendChild(saveDialog);

        this.saveButtonId = OSH.Utils.randomUUID();

        var strVar="";


        strVar += "<div class=\"horizontal-line\"><\/div>";

        strVar += "<div class=\"button-edit\">";
        strVar += "  <button id=\""+this.saveButtonId+"\" class=\"submit\">Save<\/button>";
        strVar += "</div>";


        saveDialog.innerHTML = strVar;

        OSH.EventManager.observeDiv(this.saveButtonId,"click",this.onSaveClickButtonHandler.bind(this));

    },

    onSaveClickButtonHandler:function(event) {
        this.onSave();
    },

    onSave:function() {}

});