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

OSH.UI.EntityWizardEditView = OSH.UI.View.extend({
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

        var strVar="";

        // datasource part
        strVar += OSH.Utils.createHTMLTitledLine("Data Sources");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";

        // compute DS
        strVar += "<div class=\"listbox-multiple\">";
        for(var i=0;i <properties.datasources.length;i++) {
            var id = properties.datasources[i].id;
            strVar += "<label for=\"edit-view-ds-"+id+"\">"+properties.datasources[i].name+"<\/label>";
            strVar += "<input type=\"checkbox\" name=\"edit-view-ds-"+id+"\" id=\"edit-view-ds-"+id+"\"/><br/>";
        }
        strVar += "<\/div>";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        // container part
        strVar += OSH.Utils.createHTMLTitledLine("Container");
        strVar += "<ul class=\"osh-ul\">";
        strVar += "  <li class=\"osh-li\">";
        strVar += "      <div class=\"select-style\">";
        strVar += "         <select id=\""+this.containerDivId+"\">";
        strVar += "            <option value=\"Dialog\" selected>Dialog<\/option>";
        strVar += "         <\/select>";
        strVar += "      <\/div>";
        strVar += "  <\/li>";
        strVar += "<\/ul>";

        // styler part
        strVar += OSH.Utils.createHTMLTitledLine("Styler");
        strVar += "<div class=\"styler-section\">";
        strVar += "  <div class=\"select-style\">";
        strVar += "    <select id=\""+this.stylerSelectDivId+"\">";
        strVar += "    <\/select>";
        strVar += "  <\/div>";
        strVar += "  <button id=\""+this.addStylerId+"\" class=\"submit\">Add<\/button>";
        strVar += "  <div id=\""+this.stylerContainerDivId+"\" class=\"styler-container\"><\/div>";
        strVar += "<\/div>";

        editView.innerHTML = strVar;

        // inits
        this.initStylers(this.properties.stylers);
        this.initContainer(this.properties.container);

        // listeners
        OSH.EventManager.observeDiv(this.addStylerId,"click",this.addStyler.bind(this));

    },

    initContainer: function(defaultContainer) {
        var containers = [];

        var selectContainerTag = document.getElementById(this.containerDivId);

        for(var key in containers) {

            var option = document.createElement("option");
            option.text = containers[key];
            option.value = containers[key];

            if(key === defaultContainer) {
                option.setAttribute("selected","");
            }
            selectContainerTag.add(option);
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

        var styler = {};

        if(!isUndefined(event.styler)) {
            styler = event.styler;
        } else {
            styler.name = stylerName;
            styler.id = OSH.Utils.randomUUID();
        }

        this.stylers.push(styler);

        var div = document.createElement('div');
        div.setAttribute("id","View"+OSH.Utils.randomUUID());
        div.setAttribute("class","ds-line");

        var deleteId = OSH.Utils.randomUUID();
        var editId = OSH.Utils.randomUUID();

        var strVar = "<span class=\"line-left\">"+styler.name +"<\/span>";
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
            for(var i=0;i < self.stylers.length;i++) {
                if(self.stylers[i].id !== styler.id) {
                    newArray.push(self.stylers[i]);
                }
            }

            self.stylers = newArray;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editStyler.bind(this));
    },

    editStyler:function(event) {
        var editStylerView = new OSH.UI.EntityWizardEditStylerView("",{datasources:this.properties.datasources});

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

        editStylerView.attachTo(editViewDialog.popContentDiv.id);

        editViewDialog.onSave = function() {
            var jsonProperties = editStylerView.getProperties();
            editViewDialog.close();
        }.bind(this);

    },

    onClickButtonHandler:function(event) {
        var jsonProps = {};

        jsonProps.container = "";
        jsonProps.stylers = this.stylers;

        // gets selected container
        var eltContainer = document.getElementById(this.containerDivId);
        jsonProps.container = eltContainer.options[eltContainer.selectedIndex].value;
    },

    getProperties:function() {
        var jsonProps = {};

        jsonProps.container = "";
        jsonProps.stylers = this.stylers;

        // gets selected container
        var eltContainer = document.getElementById(this.containerDivId);
        jsonProps.container = eltContainer.options[eltContainer.selectedIndex].value;

        return jsonProps;
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