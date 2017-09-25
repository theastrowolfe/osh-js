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

OSH.UI.Panel.EntityMapEditPanel = OSH.UI.Panel.EntityViewItemsEditPanel.extend({

    getNewStylerInstance:function(type) {
        if(type === "Marker") {
            return new OSH.UI.Styler.PointMarker({});
        } else if(type === "Polyline") {
            return new OSH.UI.Styler.Polyline({});
        }
    },

    getTypeFromStylerInstance:function(stylerInstance) {
        if(stylerInstance instanceof OSH.UI.Styler.PointMarker){
            return "Marker";
        } else if(stylerInstance instanceof OSH.UI.Styler.Polyline){
            return "Polyline";
        }
    },

    getStylerList:function() {
        return ["Marker","Polyline"];
    },

    getStylerPanelInstance:function(properties) {
        return new OSH.UI.Panel.StylerMarkerPanel("",properties);
    }
});