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
        this.stylerSelectDivId = OSH.Utils.randomUUID();
        this.editButton = OSH.Utils.randomUUID();
        this.stylerContainerDivId = OSH.Utils.randomUUID();
        this.addStylerId = OSH.Utils.randomUUID();
        this.dataSourceId = OSH.Utils.randomUUID();

        var strVar="";

        this.view = properties.view;

        var displayStyler = (properties.view.stylers !== null);

        // container part
        strVar += OSH.Utils.createHTMLTitledLine("View properties");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        if(!displayStyler) {
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

        if(displayStyler) {
            // styler part
            strVar += OSH.Utils.createHTMLTitledLine("Styler");
            strVar += "<div class=\"styler-section\">";
            strVar += "  <div class=\"select-style\">";
            strVar += "    <select id=\"" + this.stylerSelectDivId + "\">";
            strVar += "    <\/select>";
            strVar += "  <\/div>";
            strVar += "  <button id=\"" + this.addStylerId + "\" class=\"submit\">Add<\/button>";
            strVar += "  <div id=\"" + this.stylerContainerDivId + "\" class=\"styler-container\"><\/div>";
            strVar += "<\/div>";
        }

        editView.innerHTML = strVar;

        // inits
        if(displayStyler) {
            this.initStylers(this.view.stylers);
            // listeners
            OSH.EventManager.observeDiv(this.addStylerId,"click",this.onClickStylerButton.bind(this));
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

    initStylers: function(defaultStylerArr) {
        var stylers = ["Marker","Polyline", "Curve"];

        var selectStylerTag = document.getElementById(this.stylerSelectDivId);

        for(var key in stylers) {

            var option = document.createElement("option");
            option.text = stylers[key];
            option.value = stylers[key];

            selectStylerTag.add(option);
        }

        // inits from properties
        for(var i =0;i < defaultStylerArr.length;i++) {
            this.addStyler({styler:defaultStylerArr[i]});
        }
    },

    addStyler:function(event) {
        var dsTabElt = document.getElementById(this.stylerContainerDivId);
        var selectedViewTag = document.getElementById(this.stylerSelectDivId);
        var stylerName = selectedViewTag.options[selectedViewTag.selectedIndex].value;

        if(stylerName === "") {
            return;
        }


        var styler = null;

        if(!isUndefined(event.styler)) {
            styler = event.styler;
        } else {
            switch (stylerName) {
                case "Marker": styler = new OSH.UI.Styler.PointMarker({});break;
                case "Polyline":break;
                case "LinePlot":break;
            }
        }

        var div = document.createElement('div');
        div.setAttribute("id","View"+OSH.Utils.randomUUID());
        div.setAttribute("class","ds-line");

        var deleteId = OSH.Utils.randomUUID();
        var editId = OSH.Utils.randomUUID();

        var strVar = "<span class=\"line-left\">"+stylerName +"<\/span>";
        strVar += "   <table class=\"control line-right\">";
        strVar += "      <tr>";
        strVar += "         <td><i class=\"fa fa-2x fa-pencil-square-o edit\" aria-hidden=\"true\" id=\""+editId+"\"><\/i><\/td>";
        strVar += "         <td><i class=\"fa fa-2x fa-trash-o delete\" aria-hidden=\"true\" id=\""+deleteId+"\"><\/i><\/td>";
        strVar += "      <\/tr>";
        strVar += "   <\/table>";
        strVar += "<\/div>";
        strVar += "<div style=\"clear: both;\"><\/div>";

        div.innerHTML = strVar;

        dsTabElt.appendChild(div);

        // add listeners
        var self = this;

        OSH.EventManager.observeDiv(deleteId,"click",function(event) {
            dsTabElt.removeChild(div);
            var newArray = [];
            for(var i=0;i < self.view.stylers.length;i++) {
                if(self.view.stylers[i].id !== styler.id) {
                    newArray.push(self.view.stylers[i]);
                }
            }

            self.view.stylers = newArray;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editStyler.bind(this,styler));

        return styler;
    },

    editStyler:function(styler,event) {
        //var editStylerView = new OSH.UI.EntityEditStylerPanel("",{datasources:this.properties.datasources});
        var editStylerView = new OSH.UI.Panel.StylerMarkerPanel("",{
            datasources:this.properties.datasources,
            styler: styler
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

        editStylerView.initStyler(styler);
        editStylerView.attachTo(editViewDialog.popContentDiv.id);

        editViewDialog.onSave = function() {
            var styler = editStylerView.getStyler();

            for(var key in this.view.stylers) {
                if(this.view.stylers[key].id === styler.id) {
                    this.view.stylers[key] = styler;
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

    onClickStylerButton:function(event) {
        var newStyler = this.addStyler(event);
        this.view.stylers.push(newStyler);
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