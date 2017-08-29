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

OSH.UI.EntityEditPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, [], properties);

        this.properties = properties;
        // add template
        var editViewElt = document.createElement("div");
        editViewElt.setAttribute("id","Edit-view-"+OSH.Utils.randomUUID());
        editViewElt.setAttribute("class",'edit-view');

        document.getElementById(this.divId).appendChild(editViewElt);

        this.containerDivId = OSH.Utils.randomUUID();
        this.viewItemsContainerDivId = OSH.Utils.randomUUID();
        this.addViewItemId = OSH.Utils.randomUUID();
        this.dataSourceId = OSH.Utils.randomUUID();

        var strVar="";

        this.view = properties.view;

        var displayViewItem= (!isUndefinedOrNull(properties.view.viewItems));

        // container part
        OSH.Utils.addHTMLTitledLine(editViewElt,"View properties");

        this.inputViewNameId = OSH.Utils.addInputText(editViewElt,"Name",this.view.name);

        if(!displayViewItem) {
           OSH.Utils.addHTMLTitledLine(editViewElt,"Data Sources");
           this.dataSourceId = OSH.Utils.addHTMLListBox(editViewElt,"",[]);
        }

        // container part
        OSH.Utils.addHTMLTitledLine(editViewElt,"Container");
        this.containerDivId = OSH.Utils.addHTMLListBox(editViewElt,"",["","Dialog"]);

        if(displayViewItem) {
            // styler part
            OSH.Utils.addHTMLTitledLine(editViewElt,"View items");

            var viewItemsDivElt = document.createElement("div");
            viewItemsDivElt.setAttribute("class","viewItem-section");

            var addViewItemButtonElt = document.createElement("button");
            addViewItemButtonElt.setAttribute("id",this.addViewItemId );
            addViewItemButtonElt.setAttribute("class","submit");
            addViewItemButtonElt.innerHTML = "Add";

            var viewItemsContainerElt = document.createElement("div");
            viewItemsContainerElt.setAttribute("id",this.viewItemsContainerDivId);
            viewItemsContainerElt.setAttribute("class","viewItem-container");

            viewItemsDivElt.appendChild(addViewItemButtonElt);
            viewItemsDivElt.appendChild(viewItemsContainerElt);

            editViewElt.appendChild(viewItemsDivElt);
        }

        // inits
        if(displayViewItem) {
            this.initViewItems(this.view.viewItems);

            // listeners
            OSH.EventManager.observeDiv(this.addViewItemId,"click",this.onClickViewItemButton.bind(this));
        } else {
            this.initDataSources(this.properties.datasources);
            OSH.EventManager.observeDiv(this.dataSourceId,"change",this.onChangeDataSource.bind(this));
        }

        OSH.EventManager.observeDiv(this.containerDivId,"change",this.onChangeContainer.bind(this));

        var self = this;
        OSH.EventManager.observeDiv(this.inputViewNameId,"change",function(event){
            self.view.name = this.value;
        });
    },

    initDataSources:function(datasources) {
        var selectTag = document.getElementById(this.dataSourceId);

        for(var key in datasources) {

            var option = document.createElement("option");
            option.text = datasources[key].name;
            option.value = datasources[key].name;
            option.obj = datasources[key];

            if(this.view.datasource !== null && datasources[key].id === this.view.datasource.id) {
                option.setAttribute("selected","");
            }
            selectTag.add(option);
        }

        if(this.view.datasource === null && datasources.length > 0) {
            this.view.datasource  = datasources[0]; // default select the first one
        }
    },

    initViewItems: function(defaultViewItemArr) {
        // inits from properties
        for(var i =0;i < defaultViewItemArr.length;i++) {
            this.addViewItem({viewItem:defaultViewItemArr[i]});
        }
    },

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

        if(!isUndefined(event.viewItem)) {
            viewItem = event.viewItem;
            styler = viewItem.styler;
        } else {
            if(isUndefinedOrNull(this.nbViewItems)) {
                this.nbViewItems = 0;
            }
            viewItem = {
                id: "view-item-"+OSH.Utils.randomUUID(),
                name:"View item #"+this.nbViewItems++,
                styler: new OSH.UI.Styler.PointMarker({})
            };
            this.view.viewItems.push(viewItem);
        }

        var inputEltId = OSH.Utils.randomUUID();

        var strVar = "<div class=\"line-left view-item-line\">";
        strVar += "     <input id=\""+inputEltId+"\" name=\""+viewItem.name+"\" value=\""+viewItem.name+"\" type=\"input-text\" class=\"input-text\">";
        strVar += "     <div class=\"select-style\">";
        strVar += "         <select id=\"" + stylerSelectDivId + "\">";
        strVar += "             <option  selected value=\"Marker\">Marker<\/option>";
        strVar += "             <option  value=\"Polyline\">Polyline<\/option>";
        strVar += "             <option  value=\"LinePlot\">LinePlot<\/option>";
        strVar += "         <\/select>";
        strVar += "     <\/div>";
        strVar += "  <\/div>";

        strVar += "   <table class=\"control line-right\">";
        strVar += "      <tr>";
        strVar += "         <td><i class=\"fa fa-2x fa-pencil-square-o edit\" aria-hidden=\"true\" id=\""+editId+"\"><\/i><\/td>";
        strVar += "         <td><i class=\"fa fa-2x fa-trash-o delete\" aria-hidden=\"true\" id=\""+deleteId+"\"><\/i><\/td>";
        strVar += "      <\/tr>";
        strVar += "   <\/table>";
        strVar += "<\/div>";
        strVar += "<div style=\"clear: both;\"><\/div>";

        div.innerHTML = strVar;

        viewItemsContainerElt.appendChild(div);

        var self = this;

        OSH.EventManager.observeDiv(inputEltId,"change",function(event) {
            viewItem.name = document.getElementById(inputEltId).value;
        });

        OSH.EventManager.observeDiv(deleteId,"click",function(event) {
            viewItemsContainerElt.removeChild(div);
            var newArray = [];

            for(var i=0;i < self.view.viewItems.length;i++) {
                if(self.view.viewItems[i].id !== viewItem.id) {
                    newArray.push(self.view.viewItems[i]);
                }
            }

            self.view.viewItems = newArray;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editStyler.bind(this,viewItem));
    },

    editStyler:function(viewItem,event) {
        //var editStylerView = new OSH.UI.EntityEditStylerPanel("",{datasources:this.properties.datasources});
        var editStylerView = new OSH.UI.Panel.StylerMarkerPanel("",{
            datasources:this.properties.datasources,
            styler: viewItem.styler
        });

        var editViewDialog = new OSH.UI.SaveDialogView("", {
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

        editStylerView.loadStyler(viewItem.styler);
        editStylerView.attachTo(editViewDialog.popContentDiv.id);

        editViewDialog.onSave = function() {
            var styler = editStylerView.getStyler();

            // updates the styler of this viewItem
            for(var key in this.view.viewItems) {
                if(this.view.viewItems[key].id === viewItem.id) {
                    this.view.viewItems[key].styler = styler;
                }
            }

            editViewDialog.close();
        }.bind(this);

    },

    onChangeDataSource:function() {
        // gets selected ds
        var elt = document.getElementById(this.dataSourceId);
        this.view.datasource = elt.options[elt.selectedIndex].obj;
    },

    onChangeContainer:function() {
        // gets selected container
        var eltContainer = document.getElementById(this.containerDivId);
        this.view.container = eltContainer.options[eltContainer.selectedIndex].value;
    },

    onClickViewItemButton:function(event) {
        var newStyler = this.addViewItem(event);
    },

    getView:function() {
        return this.view;
    },

    getSelectedDS:function() {
        var res = [];

        // iterates over DSs
        for(var i=0;i <this.properties.datasources.length;i++) {
            // get checkbox element
            var elt = document.getElementById("edit-view-ds-"+this.properties.datasources[i].id);
            if(elt.checked) {
                res.push(this.properties.datasources[i]);
            }
        }
        return res;
    }
});