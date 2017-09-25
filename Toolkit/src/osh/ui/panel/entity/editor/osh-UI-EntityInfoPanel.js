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

OSH.UI.Panel.EntityInfoPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);
    },

    initPanel:function() {
        this.nameTagId = OSH.Helper.HtmlHelper.addInputText(this.divElt,"Name","My entity","entity name");
        this.iconTagId = OSH.Helper.HtmlHelper.addInputText(this.divElt,"Icon","images/cameralook.png","icon path");
        this.descriptionTagId = OSH.Helper.HtmlHelper.addInputText(this.divElt,"Description url","","description here");

        OSH.Utils.addCss(this.divElt,"info");
    }
});