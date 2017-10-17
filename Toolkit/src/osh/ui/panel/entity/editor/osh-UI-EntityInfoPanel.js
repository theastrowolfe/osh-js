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
        this.nameTagId = OSH.Helper.HtmlHelper.addInputText(this.elementDiv,"Name","My entity","entity name");
        this.iconTagId = OSH.Helper.HtmlHelper.addInputText(this.elementDiv,"Icon","images/cameralook.png","icon path");
        this.descriptionTagId = OSH.Helper.HtmlHelper.addInputText(this.elementDiv,"Description url","","description here");

        OSH.Utils.addCss(this.elementDiv,"info");
    },

    loadInfos:function(infos){
        OSH.Asserts.checkIsDefineOrNotNull(infos);
        OSH.Asserts.checkObjectPropertyPath(infos,"name", "infos.name does not exist");
        OSH.Asserts.checkObjectPropertyPath(infos,"icon", "infos.icon does not exist");
        OSH.Asserts.checkObjectPropertyPath(infos,"description", "infos.description does not exist");

        document.getElementById(this.nameTagId).value = infos.name;
        document.getElementById(this.iconTagId).value = infos.icon;
        document.getElementById(this.descriptionTagId).value = infos.description;
    }
});