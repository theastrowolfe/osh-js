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

OSH.UI.Panel.StylerLinePlotPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        // tab panel
        var tabPanel = new OSH.UI.Panel.TabPanel();

        // tab elements
        this.valesPanel = new OSH.UI.Panel.XYPanel("",this.options);
        this.colorPanel = new OSH.UI.Panel.ColorPanel("",this.options);

        tabPanel.addTab("Values",this.valesPanel.elementDiv);
        tabPanel.addTab("Color",this.colorPanel.elementDiv);

        this.elementDiv.appendChild(tabPanel.elementDiv);
    },

    getStyler:function() {
        // gets properties from panels
        var valuesPanelProperties = this.valesPanel.getProperties();
        var colorPanelProperties = this.colorPanel.getProperties();

        OSH.Asserts.checkObjectPropertyPath(valuesPanelProperties,"properties","missing property 'properties");
        OSH.Asserts.checkObjectPropertyPath(colorPanelProperties,"properties","missing property 'properties");

        // updates styler with properties
        var mergedProperties = {};

        OSH.Utils.copyProperties(valuesPanelProperties,mergedProperties);
        OSH.Utils.copyProperties(colorPanelProperties,mergedProperties);
        OSH.Utils.copyProperties(colorPanelProperties.properties.ui,mergedProperties.properties.ui,true);

        this.options.styler.updateProperties(mergedProperties.properties);

        return this.options.styler;
    }
});