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
        this.divElt = document.createElement("div");
        this.divElt.setAttribute("class", " osh panel ");
        this.divElt.setAttribute("id", this.divId);

        if(!isUndefinedOrNull(parentElementDivId) && parentElementDivId !== "") {
            document.getElementById(parentElementDivId).appendChild(this.divElt);
        } else {
            document.body.appendChild(this.divElt);
        }

        this.componentListeners = [];

        this.initPanel();
    },

    initPanel:function() {},

    addListener: function(div,listenerName, func) {
        OSH.Utils.onDomReady(function() {
            div.addEventListener(listenerName, func, false);
            this.componentListeners.push({
                div: div,
                name: listenerName,
                func: func
            });
        }.bind(this));
    },

    removeAllListerners:function() {
        for(var key in this.componentListeners) {
            var elt = this.componentListeners[key];
            elt.div.removeEventListener(elt.name,elt.func);
        }
    },

    getAsHTML:function() {
        return this.divElt.outerHTML;
    },

    /**
     *
     * @param divId
     * @instance
     * @memberof OSH.UI.Panel
     */
    attachTo : function(divId) {
        if(typeof this.divElt.parentNode !== "undefined") {
            // detach from its parent
            this.divElt.parentNode.removeChild(this.divElt);
        }
        document.getElementById(divId).appendChild(this.divElt);

        this.onResize();
    },

    /**
     * @instance
     * @memberof OSH.UI.Panel
     */
    onResize:function() {
    }
});