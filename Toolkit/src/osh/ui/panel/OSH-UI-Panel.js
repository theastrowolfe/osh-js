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


OSH.UI.Panel = BaseClass.extend({
    initialize: function (parentElementDivId,options) {
        this.divId = "panel-"+OSH.Utils.randomUUID();
        this.options = options;
        this.div = document.createElement("div");
        this.div.setAttribute("class", " osh panel ");
        this.div.setAttribute("id", this.divId);

        if(!isUndefinedOrNull(parentElementDivId) && parentElementDivId !== "") {
            document.getElementById(parentElementDivId).appendChild(this.div);
        } else {
            document.body.appendChild(this.div);
        }

        this.componentListeners = [];

        this.initPanel();
    },

    initPanel:function() {},

    addListener: function(div,listenerName, func) {
        div.addEventListener(listenerName,func,false);
        this.componentListeners.push({
            div: div,
            name:listenerName,
            func:func
        });
    },

    removeAllListerners:function() {
        for(var key in this.componentListeners) {
            var elt = this.componentListeners[key];
            elt.div.removeEventListener(elt.name,elt.func);
        }
    },

    getAsHTML:function() {
        return this.div.outerHTML;
    },

    /**
     *
     * @param divId
     * @instance
     * @memberof OSH.UI.Panel
     */
    attachTo : function(divId) {
        if(typeof this.div.parentNode !== "undefined") {
            // detach from its parent
            this.div.parentNode.removeChild(this.div);
        }
        document.getElementById(divId).appendChild(this.div);

        this.onResize();
    },

    /**
     * @instance
     * @memberof OSH.UI.Panel
     */
    onResize:function() {
    }
});