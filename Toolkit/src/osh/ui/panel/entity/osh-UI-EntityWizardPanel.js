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

OSH.UI.EntityWizardPanel = OSH.UI.Panel.extend({

    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId,[],properties);

        // read properties
        this.viewContainer = document.body.id;
        this.services = [];

        if(!isUndefinedOrNull(properties)){
            if(!isUndefinedOrNull(properties.viewContainer)){
                this.viewContainer = properties.viewContainer;
            }

            if(!isUndefinedOrNull(properties.services)) {
                this.services = properties.services;
            }
        }

        // add template
        var entityWizard = document.createElement("div");
        entityWizard.setAttribute("id","Entity-wizard-"+OSH.Utils.randomUUID());
        entityWizard.setAttribute("class",'entity-wizard');

        document.getElementById(this.divId).appendChild(entityWizard);


        var tabPanel = new OSH.UI.Panel.TabPanel();

        tabPanel.addTab("Info",this.createInfoPanel());
        tabPanel.addTab("Data Sources",this.createDSPanel());
        tabPanel.addTab("Views",this.createViewPanel());
        entityWizard.appendChild(tabPanel.div);

        this.datasources = {}; //TODO: probably to remove
        this.views = [];

        // inits views
        this.initViews();

    },

    createInfoPanel:function() {
        this.nameTagId = OSH.Utils.randomUUID();

        var strVar = "      <li class=\"osh-li\">";
        strVar += "         <label for=\""+this.nameTagId+"\">Name:<\/label>";
        strVar += "         <input id=\""+this.nameTagId+"\" type=\"text\" class=\"input-text\" value=\"My entity\">";
        strVar += "      <\/li>";
        strVar += "      <li class=\"osh-li\">";
        strVar += "         <label for=\"icon\">Icon:<\/label>";
        strVar += "         <input id=\"icon\" type=\"text\" class=\"input-text\" value=\"images\/cameralook.png\">";
        strVar += "      <\/li>";
        strVar += "      <li class=\"osh-li\">";
        strVar += "         <label for=\"description\">Description url:<\/label>";
        strVar += "         <input id=\"description\" type=\"text\" class=\"input-text\">";
        strVar += "      <\/li>";

        var ulElt = document.createElement("ul");
        ulElt.setAttribute("class","osh-ul info");
        ulElt.innerHTML = strVar;
        return ulElt;
    },

    createDSPanel:function() {
        this.addDsButtonId = OSH.Utils.randomUUID();

        var buttonElt = document.createElement("button");
        buttonElt.setAttribute("id",this.addDsButtonId);
        buttonElt.setAttribute("class","submit datasource");
        buttonElt.innerHTML = "Add";

        // listeners
        OSH.EventManager.observeDiv(this.addDsButtonId,"click",this.onAddDataSourceButtonClickHandler.bind(this));

        return buttonElt;
    },

    createViewPanel: function() {
        this.selectViewId = OSH.Utils.randomUUID();
        this.addViewButtonId = OSH.Utils.randomUUID();
        this.viewContainer = OSH.Utils.randomUUID();
        this.createButtonId = OSH.Utils.randomUUID();

        var strVar = "      <div class=\"select-style\">";
        strVar += "         <select id=\""+this.selectViewId+"\">";
        strVar += "            <option value=\"\" disabled selected>Select a view<\/option>";
        strVar += "         <\/select>";
        strVar += "      <\/div>";
        strVar += "      <button id=\""+this.addViewButtonId+"\" class=\"submit add-view-button\">Add<\/button>";
        strVar += "      <div id=\""+this.viewContainer+"\" class=\"view-container\"><\/div>";
        strVar += "      <div class=\"horizontal-line\"><\/div>";
        strVar += "      <div class=\"create\">";
        strVar += "         <button id=\""+this.createButtonId+"\" class=\"submit\" disabled>Create<\/button>";
        strVar += "      </div>";

        var viewDiv = document.createElement("div");
        viewDiv.innerHTML = strVar;

        viewDiv.setAttribute("class","views");
        // listeners
        OSH.EventManager.observeDiv(this.addViewButtonId,"click",this.addView.bind(this));
        OSH.EventManager.observeDiv(this.createButtonId,"click",this.createEntity.bind(this));

        return viewDiv;
    },

    onAddDataSourceButtonClickHandler: function(event) {
        // init discovery view
        var discoveryView = new OSH.UI.DiscoveryView("",{
            services: this.services
        });

        discoveryView.onAddHandler = this.addDataSource.bind(this);

        var discoveryDialog = new OSH.UI.DialogView("", {
            draggable: true,
            css: "dialog-discovery",
            name: "Discovery",
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [],
            destroyOnClose:true,
            modal:true,
            keepRatio:false

        });

        discoveryView.attachTo(discoveryDialog.popContentDiv.id);

        this.nbDatasources = 0;
    },

    initViews: function() {
        var views = ["Map 2D","Globe 3D", "Curve", "Video (H264)","Video (MJPEG)", "Video (MP4)"];

        var selectViewTag = document.getElementById(this.selectViewId);
        this.removeAllFromSelect(this.selectViewId);

        for(var key in views) {

            var option = document.createElement("option");
            option.text = views[key];
            option.value = views[key];

            selectViewTag.add(option);
        }

        //this.disableElt("tab3");

        this.viewAndStyler = ["Map 2D","Globe 3D", "Curve"];
    },

    editDataSource:function(dataSource) {
        this.datasources[dataSource.id] = dataSource;

        document.getElementById("ds-name-"+dataSource.id).innerHTML = dataSource.name;
    },

    addDataSource:function(dataSource) {

        this.nbDatasources++;

        if(this.nbDatasources >= 0) {
            // activate view tab
            this.enableElt("tab3");
        }
        this.datasources[dataSource.id] = dataSource;

        var dsTabElt = document.getElementById("content2");

        var div = document.createElement('div');
        div.setAttribute("id",dataSource.id);
        div.setAttribute("class","ds-line");

        var deleteId = OSH.Utils.randomUUID();
        var editId = OSH.Utils.randomUUID();

        var strVar = "<span class=\" line-left\" id=\"ds-name-"+dataSource.id+"\">"+dataSource.name+"<\/span>";
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
            delete self.datasources[dataSource.id];
            self.nbDatasources--;

            if(self.nbDatasources === 0) {
                // activate view tab
                self.disableElt("tab3");
            }
        });

        OSH.EventManager.observeDiv(editId,"click",function(event) {
            // init discovery view
            var discoveryView = new OSH.UI.DiscoveryView("",{
                services: self.services
            });

            discoveryView.onEditHandler = self.editDataSource.bind(self);

            var discoveryDialog = new OSH.UI.DialogView("", {
                draggable: true,
                css: "dialog-discovery",
                name: "Discovery",
                show:true,
                dockable: false,
                closeable: true,
                connectionIds : [],
                destroyOnClose:true,
                modal:true,
                keepRatio:false
            });

            discoveryView.attachTo(discoveryDialog.popContentDiv.id);

            // setup existing info
            discoveryView.initDataSource(self.datasources[dataSource.id]);

            discoveryView.setButton("Edit");
        });

        // get result template from datasource
        var server = new OSH.Server({
            url: "http://" + dataSource.properties.endpointUrl
        });

        // offering, observedProperty
        server.getResultTemplate(dataSource.properties.offeringID,dataSource.properties.observedProperty, function(jsonResp){
            dataSource.resultTemplate = self.buildDSStructure(dataSource,jsonResp);
        },function(error) {
            // do something
        });
    },

    addView:function(event) {
        var dsTabElt = document.getElementById(this.viewContainer);
        var selectedViewTag = document.getElementById(this.selectViewId);
        var viewName = selectedViewTag.options[selectedViewTag.selectedIndex].value;

        if(viewName === "") {
            return;
        }

        var view = {
            name: viewName,
            id: OSH.Utils.randomUUID(),
            viewItems:[],
            container: "",
            datasource: null
        };

        // check if view can handle stylers
        if(this.viewAndStyler.indexOf(viewName) <= -1 ) {
            view.stylers = null;
        }

        this.views.push(view);

        var div = document.createElement('div');
        div.setAttribute("id","View"+OSH.Utils.randomUUID());
        div.setAttribute("class","ds-line");

        var deleteId = OSH.Utils.randomUUID();
        var editId = OSH.Utils.randomUUID();

        var strVar = "<span class=\"line-left\">"+viewName+"<\/span>";
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
            // enable view select
            self.enableElt(self.selectViewId);
            self.enableElt(self.addViewButtonId);

            // enable create button
            self.disableElt(self.createButtonId);

            var newArr = [];

            for(var i=0;i < self.views.length;i++) {
                if(self.views[i].id !== view.id) {
                    newArr.push(self.views[i]);
                }
            }
            self.views = newArr;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editView.bind(this,view.id));

        // disable listbox
        //this.disableElt(this.selectViewId);
        //this.disableElt(this.addViewButtonId);

        // enable create button
        this.enableElt(this.createButtonId);
    },

    editView:function(viewId,event) {
        var currentView = null;
        // finds the view instance and updates it
        for(var i=0;i < this.views.length;i++) {
            if (this.views[i].id === viewId) {
                currentView = this.views[i];
                break;
            }
        }

        var dsArray = [];

        for(var key in this.datasources) {
            dsArray.push(this.datasources[key]);
        }

        var cloneView = {};
        OSH.Utils.copyProperties(currentView,cloneView);

        var editView = new OSH.UI.EntityEditPanel("",{
            view:cloneView,
            datasources:dsArray
        });

        var editViewDialog = new OSH.UI.SaveDialogView("", {
            draggable: true,
            css: "dialog-edit-view", //TODO: create unique class for all the views
            name: "Edit "+currentView.name+" View",
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [],
            destroyOnClose:true,
            modal:true
        });

        editView.attachTo(editViewDialog.popContentDiv.id);


        editViewDialog.onSave = function() {
            var editedView = editView.getView();

            // finds the view instance and updates it
            for(var i=0;i < this.views.length;i++) {
                if (this.views[i].id === editedView.id) {
                    this.views[i] = editedView;
                    break;
                }
            }

            editViewDialog.close();
        }.bind(this);
    },

    createEntity:function(event) {

       var entityName = document.getElementById(this.nameTagId).value;

       // get DS array
        var datasourceArray = [];
        for(var key in this.datasources) {
            datasourceArray.push(this.datasources[key]);
        }

        // creates new entity
        var newEntity = {
            id : "entity-"+OSH.Utils.randomUUID(),
            name: entityName,
            dataSources: datasourceArray
        };

       for(var i=0;i< this.views.length;i++) {
           var currentView = this.views[i];

           //var views = ["Map 2D","Globe 3D", "Curve", "Video (H264)","Video (MJPEG)", "Video (MP4)"];
           // gets view type
           var viewInstanceType = null;
           if(currentView.name === "Map 2D") {
               viewInstanceType = OSH.UI.ViewFactory.ViewInstanceType.LEAFLET;
           } else if(currentView.name === "Globe 3D") {
               viewInstanceType = OSH.UI.ViewFactory.ViewInstanceType.CESIUM;
           } else if(currentView.name === "Video (H264)") {
               viewInstanceType = OSH.UI.ViewFactory.ViewInstanceType.VIDEO_H264;
           }

           // get default view properties
           // get default view property
           var defaultViewProperties = OSH.UI.ViewFactory.getDefaultViewProperties(viewInstanceType);

           if(currentView.stylers === null ) {
               // clone DataSource
               var cloneDatasource = {};

               cloneDatasource = OSH.Utils.clone(currentView.datasource);

               cloneDatasource.id = "DataSource-"+OSH.Utils.randomUUID();
               cloneDatasource.reset();

               currentView.datasource = cloneDatasource;

               var viewInstance = OSH.UI.ViewFactory.getDefaultSimpleViewInstance(viewInstanceType,defaultViewProperties,currentView.datasource,newEntity);

               if(currentView.container.toLowerCase() === "dialog") {
                   var viewDialog = new OSH.UI.DialogView("", {
                       draggable: true,
                       css: "app-dialog", //TBD into edit view
                       name: currentView.name,
                       show:true,
                       dockable: false,
                       closeable: true,
                       connectionIds : [currentView.datasource],
                       destroyOnClose:true,
                       modal:false,
                       keepRatio:true
                   });

                   viewInstance.attachTo(viewDialog.popContentDiv.id);
               }
               //---------------------------------------------------------------//
               //--------------------- Creates DataProvider --------------------//
               //---------------------------------------------------------------//

               var dataProviderController = new OSH.DataReceiver.DataReceiverController({
                   replayFactor : currentView.datasource.replaySpeed
               });

               // We can add a group of dataSources and set the options
               dataProviderController.addEntity(newEntity);


               //---------------------------------------------------------------//
               //---------------------------- Starts ---------------------------//
               //---------------------------------------------------------------//

               // starts streaming
               dataProviderController.connectAll();
           } else {
               var viewItems = [];

               for(var j = 0;j < currentView.viewItems.length;j++) {
                   currentView.viewItems[j].entityId = newEntity.id;
               }

               var viewInstance = OSH.UI.ViewFactory.getDefaultViewInstance(viewInstanceType,defaultViewProperties,currentView.viewItems);

               if(currentView.container.toLowerCase() === "dialog") {
                   var viewDialog = new OSH.UI.DialogView("", {
                       draggable: true,
                       css: "app-dialog", //TBD into edit view
                       name: currentView.name,
                       show:true,
                       dockable: false,
                       closeable: true,
                       connectionIds : [],//TODO
                       destroyOnClose:true,
                       modal:false,
                       keepRatio:false
                   });

                   viewInstance.attachTo(viewDialog.popContentDiv.id);
               }

               //---------------------------------------------------------------//
               //--------------------- Creates DataProvider --------------------//
               //---------------------------------------------------------------//

               var dataProviderController = new OSH.DataReceiver.DataReceiverController({
                   replayFactor : 1 //TODO:which datasource??!
               });

               // We can add a group of dataSources and set the options
               dataProviderController.addEntity(newEntity);

               //---------------------------------------------------------------//
               //---------------------------- Starts ---------------------------//
               //---------------------------------------------------------------//

               // starts streaming
               dataProviderController.connectAll();
           }
       }
    },


    removeAllFromSelect:function(tagId) {
        var i;
        var selectTag = document.getElementById(tagId);
        for (i = selectTag.options.length - 1; i > 0; i--) {
            selectTag.remove(i);
        }
    },

    enableElt:function(id) {
        document.getElementById(id).removeAttribute("disabled","");
    },

    disableElt:function(id) {
        document.getElementById(id).setAttribute("disabled","");
    },

    buildDSStructure:function(datasource,resultTemplate) {
        var result = [];
        var currentObj = null;
        var group = null;

        OSH.Utils.traverse(resultTemplate.GetResultTemplateResponse.resultStructure.field,function(key,value,params) {
            if(params.defLevel !== null && params.level < params.defLevel) {
                result.push(currentObj);
                currentObj = null;
                params.defLevel = null;
            }

            if(group !== null && params.level < group.level  ) {
                group = null;
            }

            if(!isUndefinedOrNull (value.definition)) {

                var saveGroup = false;
                if(currentObj !== null) {
                    saveGroup = true;
                    group = {
                        path:currentObj.path,
                        level:params.level,
                        object: currentObj.object
                    };
                }

                currentObj = {
                    definition : value.definition,
                    path:  null,
                    object: value
                };

                params.defLevel = params.level+1;
            }

            if(params.defLevel !== null && params.level >= params.defLevel) {
                if(key === "name") {
                    if(currentObj.path === null) {
                        if(group !== null) {
                            currentObj.path = group.path + "."+value;
                            currentObj.parentObject = group.object;
                        } else {
                            currentObj.path = value;
                        }
                    } else {
                        currentObj.path = currentObj.path+"."+value;
                    }
                }
            }
        },{level:0,defLevel:null});

        if(currentObj !== null) {
            result.push(currentObj);
        }

        for(var key in result) {
            var uiLabel = "no label/axisID/name defined";
            if(!isUndefinedOrNull (result[key].object.label)) {
                uiLabel = result[key].object.label;
            } else if(!isUndefinedOrNull (result[key].object.axisID)) {
                uiLabel = result[key].object.axisID;
            } else if(!isUndefinedOrNull (result[key].object.name)) {
                uiLabel = result[key].object.name;
            }
            result[key].uiLabel = uiLabel;
        }
        return result;
    }
});