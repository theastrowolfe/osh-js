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

OSH.UI.Panel.EntityChartEditPanel = OSH.UI.Panel.EntityViewItemsEditPanel.extend({

    buildViewProperties: function() {
        this._super();

        this.inputXLabelId = OSH.Helper.HtmlHelper.addInputText(this.viewPropertiesElt,"X label",null,"x label");
        this.inputYLabelId = OSH.Helper.HtmlHelper.addInputText(this.viewPropertiesElt,"Y label",null,"y label");
        this.inputMaxPoint = OSH.Helper.HtmlHelper.addInputText(this.viewPropertiesElt,"Max points",null,"maximum points displayed at the same time");

        OSH.Helper.HtmlHelper.onDomReady(function(){
            document.getElementById(this.inputXLabelId).value = this.options.view.xLabel;
            document.getElementById(this.inputYLabelId).value = this.options.view.yLabel;
            document.getElementById(this.inputMaxPoint).value = this.options.view.maxPoints;
        }.bind(this));
    },

    getStylerList:function() {
        return [OSH.UI.Styler.Factory.TYPE.LINE_PLOT];
    },

    getStylerPanelInstance:function(properties) {
        return new OSH.UI.Panel.StylerLinePlotPanel("",properties);
    },

    getProperties:function() {
        var superProperties = this._super();

        OSH.Utils.copyProperties({
            xLabel:  document.getElementById(this.inputXLabelId).value,
            yLabel: document.getElementById(this.inputYLabelId).value,
            maxPoints:Number(document.getElementById(this.inputMaxPoint).value)
        },superProperties,true);

        return superProperties;
    },

    getView:function() {
        return this.view;
    }
});