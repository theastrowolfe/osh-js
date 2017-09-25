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

OSH.UI.Panel.StylerMarkerPanel = OSH.UI.Panel.StylerPanel.extend({
    initialize:function(parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        // tab panel
        var tabPanel = new OSH.UI.Panel.TabPanel();

        // tab elements
        this.locationPanel = new OSH.UI.Panel.LocationPanel("",this.options);
        this.iconPanel = new OSH.UI.Panel.IconPanel("",this.options);

        tabPanel.addTab("Location",this.locationPanel.divElt);
        tabPanel.addTab("Icon",this.iconPanel.divElt);

        this.divElt.appendChild(tabPanel.divElt);
    },

    getStyler:function() {
        var uiProperties = {};

        // gets properties from panels
        var locationPanelProperties = this.locationPanel.getProperties();
        var iconPanelProperties = this.iconPanel.getProperties();

        // copies UI properties
        OSH.Utils.copyProperties(locationPanelProperties,uiProperties);
        OSH.Utils.copyProperties(iconPanelProperties,uiProperties);

        // updates styler with properties
        this.options.styler.updateProperties(locationPanelProperties);
        this.options.styler.updateProperties(iconPanelProperties);

        // saves UI properties into styler object to be reloaded
        OSH.Utils.copyProperties(uiProperties,this.options.styler,true);

        return this.options.styler;
    }
});