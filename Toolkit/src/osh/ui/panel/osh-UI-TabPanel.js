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

OSH.UI.Panel.TabPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel:function() {
        this.mainElt = document.createElement("main");
        this.mainElt.setAttribute("class","tab-panel");

        this.elementDiv.appendChild(this.mainElt);

        this.sectionNb = 0;

        this.sectionElts = [];
        this.labelElt = [];
    },

    addTab: function(label, div) {
        var id = OSH.Utils.randomUUID();

        var inputElt = document.createElement("input");
        inputElt.setAttribute("id","tab"+this.sectionNb);
        inputElt.setAttribute("type","radio");
        inputElt.setAttribute("name","tabs");

        var labelElt = document.createElement("label");
        labelElt.setAttribute("for",id);
        labelElt.setAttribute("id","label-"+id);
        labelElt.innerHTML = label;

        var sectionElt = document.createElement("section");
        sectionElt.setAttribute("id","content"+(this.sectionNb));
        sectionElt.setAttribute("class","hide-tab");

        sectionElt.appendChild(div);
        this.sectionElts.push(sectionElt);

        this.labelElt.push({
            label : labelElt,
            input: inputElt
        });

        OSH.Helper.HtmlHelper.removeAllNodes(this.mainElt);

        for(var key in this.labelElt) {
            this.mainElt.appendChild(this.labelElt[key].input);
            this.mainElt.appendChild(this.labelElt[key].label);
        }

        for(var key in this.sectionElts)  {
            this.mainElt.appendChild(this.sectionElts[key]);
        }

        // listeners
        OSH.EventManager.observeDiv(labelElt.id,"click",this.setChecked.bind(this,inputElt,sectionElt));

        var self = this;
        OSH.Helper.HtmlHelper.onDomReady(function(){
            OSH.Helper.HtmlHelper.fireEvent(self.labelElt[0].label, "click");
        });
    },

    setChecked:function(inputElt,sectionElt,evt) {
        if(!isUndefinedOrNull(this.currentSelectedInput)) {
            this.currentSelectedInput.removeAttribute("checked");
        }

        if(!isUndefinedOrNull(this.currentSelectedSection)) {
            OSH.Utils.replaceCss(this.currentSelectedSection,"show-tab","hide-tab");
        }


        inputElt.setAttribute("checked","");
        OSH.Utils.replaceCss(sectionElt,"hide-tab","show-tab");

        this.currentSelectedInput = inputElt;
        this.currentSelectedSection = sectionElt;
    },

    disableTab:function(index) {},

    addToTab:function(index,div) {
        this.sectionElts[index].appendChild(div);
    }
});