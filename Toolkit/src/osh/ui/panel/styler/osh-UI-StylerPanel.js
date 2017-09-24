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

OSH.UI.Panel.StylerPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, options) {
        this.styler = options.styler;
        this._super(parentElementDivId, options);
    },

    getObservable:function(datasourceSelectId) {
        var datasourceSelectTag = document.getElementById(datasourceSelectId);

        // fills corresponding observable
        var currentDS = this.options.datasources[datasourceSelectTag.selectedIndex];

        var result = [];

        if(!isUndefinedOrNull(currentDS)) {
            for (var key in currentDS.resultTemplate) {

                result.push({
                    uiLabel: currentDS.resultTemplate[key].uiLabel,
                    object: currentDS.resultTemplate[key].object
                });
            }
        }

        return result;
    },

    loadObservable:function(datasourceSelectId,observableSelectId) {
        var isNotEmpty = true;

        OSH.Helper.HtmlHelper.removeAllFromSelect(observableSelectId);
        var datasourceSelectTag = document.getElementById(datasourceSelectId);
        var observableSelectTag = document.getElementById(observableSelectId);

        // fills corresponding observable
        var currentDS = this.options.datasources[datasourceSelectTag.selectedIndex];

        if(!isUndefinedOrNull(currentDS)) {
            for (var key in currentDS.resultTemplate) {

                var option = document.createElement("option");
                option.text = currentDS.resultTemplate[key].uiLabel;
                option.value = currentDS.resultTemplate[key].uiLabel;
                option.object = currentDS.resultTemplate[key].object;

                observableSelectTag.add(option);
                isNotEmpty = false;
            }
        }

        return isNotEmpty;
    },

    loadUom:function(observableSelectId,thresholdInputId) {
        // gets selected observable
        var observableSelectTag = document.getElementById(observableSelectId);
        var observableOptionSelectedTag = observableSelectTag.options[observableSelectTag.selectedIndex];

        if(!isUndefined(observableOptionSelectedTag) && !isUndefined(observableOptionSelectedTag.object.uom)) {
            var uom = OSH.Utils.getUOM(observableOptionSelectedTag.object.uom);
            if(!isUndefinedOrNull(uom)) {
                document.getElementById(thresholdInputId).nextElementSibling.innerHTML = uom;
            } else {
                document.getElementById(thresholdInputId).nextElementSibling.innerHTML = "";
            }
        } else {
            document.getElementById(thresholdInputId).nextElementSibling.innerHTML = "";
        }
    },

    /**
     * To be overridden
     */
    getProperties:function(){},

    loadData:function(data){},

    loadStyler:function(styler){}

});