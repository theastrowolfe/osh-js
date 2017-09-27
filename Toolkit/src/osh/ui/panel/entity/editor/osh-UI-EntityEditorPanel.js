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

OSH.UI.Panel.EntityEditorPanel = OSH.UI.Panel.extend({

    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId,properties);

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

            if(!isUndefinedOrNull(properties.entity)) {
                this.entity = properties.entity;
            }
        }

        if(isUndefinedOrNull(this.entity)) {
            // creates new entity
            this.entity = {
                id: "entity-" + OSH.Utils.randomUUID(),
                dataSources: [],
                dataProviderController: new OSH.DataReceiver.DataReceiverController({
                    replayFactor: 1 //TODO:which datasource??!
                })
            };
        }

        // add template
        var entityEditor = document.createElement("div");
        entityEditor.setAttribute("id","Entity-editor-"+OSH.Utils.randomUUID());
        entityEditor.setAttribute("class",'entity-editor');

        document.getElementById(this.divId).appendChild(entityEditor);

        this.tabPanel = new OSH.UI.Panel.TabPanel();

        this.tabPanel.addTab("File",this.createFilePanel());
        this.tabPanel.addTab("Info",this.createInfoPanel());
        this.tabPanel.addTab("Data Sources",this.createDSPanel());
        this.tabPanel.addTab("Views",this.createViewPanel());

        entityEditor.appendChild(this.tabPanel.divElt);
        OSH.Helper.HtmlHelper.addHTMLLine(entityEditor);

        var createButtonElt = document.createElement("button");
        createButtonElt.setAttribute("class","submit save-entity-button");

        createButtonElt.innerHTML = "Save";

        entityEditor.appendChild(createButtonElt);


        // inits properties
        this.properties = {
            datasources : {},
            views : []
        };

        // inits views
        //this.initViews();

        // inits datasources
        //this.initDatasources();

        this.addListener(createButtonElt, "click", this.saveEntity.bind(this));

    },

    createFilePanel:function() {
        var filePanel = new OSH.UI.Panel.EntityFilePanel();
        filePanel.beforeOnSaveProperties = function() {
            return this.datasourcePanel.datasources;
        }.bind(this);

        return filePanel.divElt;
    },

    createInfoPanel:function() {
        this.infoPanel = new OSH.UI.Panel.EntityInfoPanel();
        return this.infoPanel.divElt;
    },

    createDSPanel:function() {
       this.datasourcePanel = new OSH.UI.Panel.EntityDatasourcePanel("",{services:this.services});
       return this.datasourcePanel.divElt;
    },

    createViewPanel: function() {
        this.viewPanel = new OSH.UI.Panel.EntityViewPanel("",{
            datasources:this.datasourcePanel.datasources,
            entityId:this.entity.id
        });

        return this.viewPanel.divElt;
    },

    initDatasources: function() {
        if(!isUndefinedOrNull(this.entity.datacontroller)) {
            for (var key in this.entity.dataSources){
                var ds = this.entity.datacontroller.getDataSource(this.entity.dataSources[key]);
                this.datasourcePanel.addDataSource(ds);
            }
        }
    },

    createEntity:function(event) {

       var entityName = document.getElementById(this.nameTagId).value;

        // get DS array
        var replayFactor = 1;
        var datasourceArray = [];
        for(var key in this.properties.datasources) {
            datasourceArray.push(this.properties.datasources[key]);
            replayFactor = this.properties.datasources[key].replaySpeed;
        }

        // updates name & data sources
        this.entity.name = entityName;

        //TODO: make the diff between exsiting ones and the ones which have been removed/added
        this.entity.dataSources = datasourceArray;

        if(isUndefinedOrNull(this.entity.datacontroller)) {
             this.entity.datacontroller = new OSH.DataReceiver.DataReceiverController({
                    replayFactor : replayFactor
             });
            this.entity.datacontroller.addEntity(this.entity);
            // starts streaming
            this.entity.datacontroller.connectAll();
        }

       for(var i=0;i< this.properties.views.length;i++) {
           var currentView = this.properties.views[i];

           // checks if view exists
           if (isUndefinedOrNull(currentView.instance) || isUndefinedOrNull(document.getElementById(currentView.instance.id))) { // is not an existing instance

               // gets view type
               var viewInstanceType = currentView.viewInstanceType;

               // gets default view properties
               // gets default view property
               var defaultViewProperties = OSH.UI.ViewFactory.getDefaultViewProperties(viewInstanceType);
               var viewInstance;

               if (isUndefinedOrNull(currentView.viewItems)) {
                   viewInstance = OSH.UI.ViewFactory.getDefaultSimpleViewInstance(viewInstanceType, defaultViewProperties, currentView.datasource, this.entity);
                   this.createViewNoViewItems(currentView, viewInstance, this.entity);
               } else  { // view items instance
                   var viewItems = [];
                   for (var j = 0; j < currentView.viewItems.length; j++) {
                       currentView.viewItems[j].entityId = this.entity.id;
                   }

                   viewInstance = OSH.UI.ViewFactory.getDefaultViewInstance(viewInstanceType, defaultViewProperties, currentView.viewItems);
                   this.createViewItems(currentView, viewInstance, this.entity);
               }

               this.properties.views[i].instance = viewInstance;
           } else {
               // the instance already exist, the entity has to be added/updated to this instance
           }

           //TODO: check container and switch if currentView.container != view.divElt.parentNode.id
       }
    },


    enableElt:function(id) {
        document.getElementById(id).removeAttribute("disabled","");
    },

    disableElt:function(id) {
        document.getElementById(id).setAttribute("disabled","");
    },

    createViewNoViewItems:function(currentView,viewInstance,newEntity) {
        if (currentView.container.toLowerCase() === "dialog") {
            var viewDialog = new OSH.UI.Panel.DialogPanel("", {
                draggable: true,
                css: "app-dialog", //TBD into edit view
                name: currentView.name,
                show: true,
                dockable: false,
                closeable: true,
                connectionIds: [currentView.datasource.id],
                destroyOnClose: true,
                modal: false,
                keepRatio: true
            });

            viewInstance.attachTo(viewDialog.popContentDiv.id);
        }

        var dataProviderController = new OSH.DataReceiver.DataReceiverController({
            replayFactor: currentView.datasource.replaySpeed
        });

        // We can add a group of dataSources and set the options
        dataProviderController.addEntity(newEntity);

        // starts streaming
        dataProviderController.connectAll();
    },

    createViewItems:function(currentView,viewInstance,newEntity) {
        if (currentView.container.toLowerCase() === "dialog") {
            var viewDialog = new OSH.UI.Panel.DialogPanel("", {
                draggable: true,
                css: "app-dialog", //TBD into edit view
                name: currentView.name,
                show: true,
                dockable: false,
                closeable: true,
                connectionIds: [],//TODO
                destroyOnClose: true,
                modal: false,
                keepRatio: false
            });

            viewInstance.attachTo(viewDialog.popContentDiv.id);
        }

        var dataProviderController = new OSH.DataReceiver.DataReceiverController({
            replayFactor: 1 //TODO:which datasource??!
        });

        // We can add a group of dataSources and set the options
        dataProviderController.addEntity(newEntity);

        // starts streaming
        dataProviderController.connectAll();
    },

    saveEntity:function() {
        for(var key in this.datasourcePanel.datasources) {
            var ds = this.datasourcePanel.datasources[key];
            // add datasource to dataprovider
            this.entity.dataProviderController.addDataSource(ds);
            // connects datasource
            ds.connect();
        }
    }
});