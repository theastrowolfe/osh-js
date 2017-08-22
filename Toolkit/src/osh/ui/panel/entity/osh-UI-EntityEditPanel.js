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
        var editView = document.createElement("div");
        editView.setAttribute("id","Edit-view-"+OSH.Utils.randomUUID());
        editView.setAttribute("class",'edit-view');

        document.getElementById(this.divId).appendChild(editView);

        this.containerDivId = OSH.Utils.randomUUID();
        this.viewItemsContainerDivId = OSH.Utils.randomUUID();
        this.addViewItemId = OSH.Utils.randomUUID();
        this.dataSourceId = OSH.Utils.randomUUID();

        var strVar="";

        this.view = properties.view;

        var displayViewItem= (!isUndefinedOrNull(properties.view.viewItems));

        // container part
        strVar += OSH.Utils.createHTMLTitledLine("View properties");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        if(!displayViewItem) {
            // datasource part
            strVar += OSH.Utils.createHTMLTitledLine("Data Sources");
            strVar += "<ul class=\"osh-ul\">";
            strVar += "  <li class=\"osh-li\">";
            strVar += "      <div class=\"select-style\">";
            strVar += "         <select id=\""+this.dataSourceId+"\">";
            strVar += "            <option value=\"\" selected disabled><\/option>";
            strVar += "         <\/select>";
            strVar += "      <\/div>";
            strVar += "  <\/li>";
            strVar += "<\/ul>";
        }

        // container part
        strVar += OSH.Utils.createHTMLTitledLine("Container");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";
        strVar += "      <div class=\"select-style\">";
        strVar += "         <select id=\""+this.containerDivId+"\">";
        strVar += "            <option value=\"\" selected disabled><\/option>";
        strVar += "         <\/select>";
        strVar += "      <\/div>";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        if(displayViewItem) {
            // styler part
            strVar += OSH.Utils.createHTMLTitledLine("View items");
            strVar += "<div class=\"viewItem-section\">";
            strVar += "  <button id=\"" + this.addViewItemId + "\" class=\"submit\">Add<\/button>";
            strVar += "  <div id=\"" + this.viewItemsContainerDivId + "\" class=\"viewItem-container\"><\/div>";
            strVar += "<\/div>";
        }

        editView.innerHTML = strVar;

        // inits
        if(displayViewItem) {
            this.initViewItems(this.view.viewItems);

            // listeners
            OSH.EventManager.observeDiv(this.addViewItemId,"click",this.onClickViewItemButton.bind(this));
        } else {
            this.initDataSources(this.properties.datasources);
            OSH.EventManager.observeDiv(this.dataSourceId,"change",this.onChangeDataSource.bind(this));
        }

        this.initContainer(this.view.container);

        OSH.EventManager.observeDiv(this.containerDivId,"change",this.onChangeContainer.bind(this));
    },

    initContainer: function(defaultContainer) {
        var containers = ["Dialog"];

        var selectContainerTag = document.getElementById(this.containerDivId);

        for(var key in containers) {

            var option = document.createElement("option");
            option.text = containers[key];
            option.value = containers[key];

            if(containers[key] === defaultContainer) {
                option.setAttribute("selected","");
            }
            selectContainerTag.add(option);
        }

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
            viewItem = {
                id: "view-item-"+OSH.Utils.randomUUID(),
                name:"View item #"+this.view.viewItems.length,
                styler: new OSH.UI.Styler.PointMarker({})
            };
            this.view.viewItems.push(viewItem);
        }

        var strVar = "<div class=\"line-left view-item-line\">";
        strVar += "     <input name=\""+viewItem.name+"\" value=\""+viewItem.name+"\" type=\"input-text\" class=\"input-text\">";
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

        editStylerView.initStyler(viewItem.styler);
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