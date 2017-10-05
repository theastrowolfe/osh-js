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

OSH.UI.Panel.EntityViewItemsEditPanel = OSH.UI.Panel.EntityEditViewPanel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    buildContent:function() {
        var viewItems = [];
        if(!isUndefinedOrNull(this.view.viewItems) && this.view.viewItems.length > 0) {
            viewItems = this.view.viewItems;
        }

        if(!isUndefinedOrNull(this.view.viewItemsToAdd) && this.view.viewItemsToAdd.length > 0) {
            viewItems = viewItems.concat(this.view.viewItemsToAdd);
        }

        this.buildViewItems(viewItems);
    },

    buildViewItems:function(defaultViewItemArr) {
        if(isUndefinedOrNull(this.view.viewItemsToAdd)) {
            this.view.viewItemsToAdd = [];
        }
        if(isUndefinedOrNull(this.view.viewItemsToRemove)) {
            this.view.viewItemsToRemove = [];
        }

        // styler part
        this.viewItemsContainerDivId = OSH.Utils.randomUUID();
        var addViewItemId = OSH.Utils.randomUUID();

        OSH.Helper.HtmlHelper.addHTMLTitledLine(this.contentElt,"View items");

        var viewItemsDivElt = document.createElement("div");
        viewItemsDivElt.setAttribute("class","viewItem-section");

        var addViewItemButtonElt = document.createElement("button");
        addViewItemButtonElt.setAttribute("id",addViewItemId );
        addViewItemButtonElt.setAttribute("class","submit");
        addViewItemButtonElt.innerHTML = "Add";

        var viewItemsContainerElt = document.createElement("div");
        viewItemsContainerElt.setAttribute("id",this.viewItemsContainerDivId);
        viewItemsContainerElt.setAttribute("class","viewItem-container");

        viewItemsDivElt.appendChild(addViewItemButtonElt);
        viewItemsDivElt.appendChild(viewItemsContainerElt);

        this.contentElt.appendChild(viewItemsDivElt);

        // inits from properties
        // check if the current view items are part of the current entity
        for(var i =0;i < defaultViewItemArr.length;i++) {
            if(!isUndefinedOrNull(defaultViewItemArr[i].entityId) &&
                defaultViewItemArr[i].entityId === this.entityId) {
                this.addViewItem({viewItem: defaultViewItemArr[i]});
            }
        }

        // listeners
        var self = this;

        OSH.EventManager.observeDiv(addViewItemId,"click",function (event) {
            var newStyler = self.addViewItem(event);
        });
    },

    // ACTION FUNCTIONS
    addViewItem:function(event) {
        var viewItemsContainerElt = document.getElementById(this.viewItemsContainerDivId);

        var id = OSH.Utils.randomUUID();
        var stylerSelectDivId = "styler-"+id;

        var div = document.createElement('div');
        div.setAttribute("id","viewItem-"+id);
        div.setAttribute("class","ds-line");

        var deleteId = "delete-"+id;
        var editId = "edit-"+id;

        var viewItem = null;
        var styler = null;

        // gets styler list from current instance
        var stylerList = this.getStylerList();

        var selectedStylerName = stylerList[0];

        if(!isUndefined(event.viewItem)) {
            //TODO: check if that is still necessary with the new architecture
            viewItem = event.viewItem;
            styler = viewItem.styler;
            selectedStylerName = OSH.UI.Styler.Factory.getTypeFromInstance(styler);
        } else {
            if(isUndefinedOrNull(this.nbViewItems)) {
                this.nbViewItems = 0;
            }

            var stylerUI = null;

            if(!isUndefinedOrNull(stylerList)){
                stylerUI = OSH.UI.Styler.Factory.getNewInstanceFromType(stylerList[0]);
            }

            viewItem = {
                id: "view-item-"+OSH.Utils.randomUUID(),
                name:"View item #"+this.nbViewItems++,
                styler: stylerUI
            };

            if(!isUndefinedOrNull(this.entityId)) {
                viewItem.entityId = this.entityId;
            }

            this.view.viewItemsToAdd.push(viewItem);
        }

        var inputEltId = OSH.Utils.randomUUID();

        var strVar = "<div class=\"line-left view-item-line\">";
        strVar += "     <input id=\""+inputEltId+"\" name=\""+viewItem.name+"\" value=\""+viewItem.name+"\" type=\"input-text\" class=\"input-text\">";
        strVar += "     <div class=\"select-style\">";
        strVar += "         <select id=\"" + stylerSelectDivId + "\">";

        for(var i=0;i < stylerList.length;i++) {
            if(stylerList[i] === selectedStylerName) {
                strVar += "             <option  selected value=\""+stylerList[i]+"\">"+stylerList[i]+"<\/option>";
            } else {
                strVar += "             <option  value=\""+stylerList[i]+"\">"+stylerList[i]+"<\/option>";
            }
        }

        strVar += "         <\/select>";
        strVar += "     <\/div>";
        strVar += "  <\/div>";

        strVar += "   <table class=\"control line-right\">";
        strVar += "      <tr>";
        strVar += "         <td><i class=\"fa fa-2x fa-pencil-square-o edit\" aria-hidden=\"true\" id=\"" + editId + "\"><\/i><\/td>";
        strVar += "         <td><i class=\"fa fa-2x fa-trash-o delete\" aria-hidden=\"true\" id=\"" + deleteId + "\"><\/i><\/td>";
        strVar += "      <\/tr>";
        strVar += "   <\/table>";
        strVar += "<\/div>";
        strVar += "<div style=\"clear: both;\"><\/div>";

        div.innerHTML = strVar;

        viewItemsContainerElt.appendChild(div);

        var self = this;

        OSH.EventManager.observeDiv(inputEltId, "change", function (event) {
            viewItem.name = document.getElementById(inputEltId).value;
        });

        OSH.EventManager.observeDiv(deleteId, "click", function (event) {
            viewItemsContainerElt.removeChild(div);
            self.view.viewItemsToRemove.push(viewItem);
        });

        OSH.EventManager.observeDiv(editId, "click", this.editStyler.bind(this, viewItem));

        OSH.EventManager.observeDiv(stylerSelectDivId, "change", function (event) {
            var vItem = self.getViewItemById(viewItem.id);
            vItem.styler = self.getNewStylerInstance(this.options[this.selectedIndex].value);
        });
    },

    editStyler:function(viewItem,event) {
        var editStylerView = this.getStylerPanelInstance({
            datasources:this.options.datasources,
            styler: viewItem.styler
        });

        var editViewDialog = new OSH.UI.Panel.SaveDialogPanel("", {
            draggable: true,
            css: "dialog-edit-view", //TODO: create unique class for all the views
            name: "Edit Styler",
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [],
            destroyOnClose:true,
            modal:true
        });

        editStylerView.attachTo(editViewDialog.popContentDiv.id);

        var self = this;

        (function(viewItemId) {
            editViewDialog.onSave = function() {
                var styler = editStylerView.getStyler();

                // updates the styler of this viewItem
                var viewItem = self.getViewItemById(viewItemId);
                viewItem.styler = styler;

                editViewDialog.close();
            };
        })(viewItem.id); //passing the variable to freeze, creating a new closure
    },

    /**
     * This builds a new instance of the selected styler corresponding to the viewItem.
     * Each subclass has to return its own instance
     */
    getNewStylerInstance:function(name) {},

    getTypeFromStylerInstance:function(stylerInstance) {},

    /**
     * This gets the available styler list compatible with the view.
     * Each subclass has to return its own list
     */
    getStylerList:function() { return [];},

    getStylerPanelInstance:function(properties) {},

    getViewItemById:function(id) {
        var result=null;

        for(var key in this.view.viewItems) {
            if(this.view.viewItems[key].id === id) {
                result = this.view.viewItems[key];
                break;
            }
        }
        if(result === null) {
            for(var key in this.view.viewItemsToAdd) {
                if(this.view.viewItemsToAdd[key].id === id) {
                    result = this.view.viewItemsToAdd[key];
                    break;
                }
            }
        }

        return result;
    }
});