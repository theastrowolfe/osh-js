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

OSH.UI.Panel.EntityVideoEditPanel = OSH.UI.Panel.EntityViewItemsEditPanel.extend({

    buildViewProperties: function() {
        this._super();

        this.keepRatioCheckboxId = OSH.Helper.HtmlHelper.addCheckbox(this.viewPropertiesElt,"Keep ratio",this.view.options.keepRatio);
        this.showFpsCheckboxId = OSH.Helper.HtmlHelper.addCheckbox(this.viewPropertiesElt,"Show fps",this.view.options.showFps);
    },

    getStylerList:function() {
        return [OSH.UI.Styler.Factory.TYPE.VIDEO];
    },

    getStylerPanelInstance:function(properties) {
        return new OSH.UI.Panel.StylerVideoPanel("",properties);
    },

    getProperties:function() {
        var superProperties = this._super();

        OSH.Utils.copyProperties({
            showFps:  document.getElementById(this.showFpsCheckboxId).checked,
            keepRatio: document.getElementById(this.keepRatioCheckboxId).checked
        },superProperties,true);

        return superProperties;
    },
});