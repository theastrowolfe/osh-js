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
        this.locationPanel = new OSH.UI.Panel.LocationPanel("",{datasources:this.options.datasources});
        this.iconPanel = new OSH.UI.Panel.IconPanel("",{datasources:this.options.datasources});

        tabPanel.addTab("Location",this.locationPanel .div);
        tabPanel.addTab("Icon",this.iconPanel .div);

        this.div.appendChild(tabPanel.div);
    },

    initStyler:function(styler){
        //TODO: edit using existing values
    },

    getStyler:function() {
        // concats properties from all tabs
        var properties = { icon: {}};

        // copy properties from icon panel
        OSH.Utils.copyProperties(this.iconPanel.properties,properties.icon);

        //var styler = new OSH.UI.Styler.Factory.createMarkerStyler(properties);
        var stylerProps = OSH.UI.Styler.Factory.createMarkerStylerProperties(properties);
        this.options.styler.initProperties(stylerProps);
        return this.options.styler;
    }
});