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

/**
 * @classdesc Display a dialog with multiple view attach to it.
 * @class
 * @type {OSH.UI.DialogPanel}
 * @augments OSH.UI.DialogPanel
 */
OSH.UI.Panel.MultiDialogPanel = OSH.UI.Panel.DialogPanel.extend({

    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);
        this.properties = properties;
    },

    initPanel: function () {
        this._super();

        // creates extra
        this.extraElt = this.createExtra();

        this.innerElementDiv.insertChildAtIndex(this.extraElt,2);

    },

    createExtra:function() {
        var extraElt = document.createElement("div");
        extraElt.setAttribute("class", "dialog-extra");

        var inputExtraElt = document.createElement("input");
        inputExtraElt.setAttribute("type","checkbox");
        inputExtraElt.setAttribute("name","dialog-extra-input");
        inputExtraElt.setAttribute("id","dialog-extra-input");

        var labelExtraElt = document.createElement("label");
        labelExtraElt.setAttribute("for","dialog-extra-input");
        var iExtraElt = document.createElement("i");
        iExtraElt.setAttribute("class","fa fa-fw icon-extra");

        labelExtraElt.appendChild(iExtraElt);

        var extraContentElt = document.createElement("div");
        extraContentElt.setAttribute("class","dialog-extra-content");

        extraElt.appendChild(inputExtraElt);
        extraElt.appendChild(labelExtraElt);
        extraElt.appendChild(extraContentElt);

        return extraElt;
    },

    minimize:function() {
        this._super();
        OSH.Utils.addCss(this.extraElt,"hide");
    },

    restore:function() {
        this._super();
        OSH.Utils.removeCss(this.extraElt,"hide");
    },

    appendView:function(elementId,properties) {
        var extraEltContent = this.extraElt.querySelector(".dialog-extra-content");
        var element = document.getElementById(elementId);

        OSH.Asserts.checkIsDefineOrNotNull(extraEltContent);
        OSH.Asserts.checkIsDefineOrNotNull(elementId);

        extraEltContent.appendChild(element);
    }
});