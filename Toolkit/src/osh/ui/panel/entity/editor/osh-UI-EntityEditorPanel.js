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
            this.createEntity();
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

        this.addListener(createButtonElt, "click", this.saveEntity.bind(this));
    },

    createEntity:function() {
        this.entity = {
            id: "entity-" + OSH.Utils.randomUUID(),
            dataSources: [],
            dataProviderController: new OSH.DataReceiver.DataReceiverController({
                replayFactor: 1 //TODO:which datasource??!
            })
        };
    },

    createFilePanel:function() {
        var filePanel = new OSH.UI.Panel.EntityFilePanel();
        filePanel.beforeOnSaveProperties = function() {
            return this.createSaveProperty();
        }.bind(this);

        filePanel.loadPropertiesHandler = function(properties) {
            this.restoreSavedProperties(properties);
         }.bind(this);
        return filePanel.divElt;
    },

    createInfoPanel:function() {
        this.infoPanel = new OSH.UI.Panel.EntityInfoPanel();
        return this.infoPanel.divElt;
    },

    createDSPanel:function() {
       this.datasourcePanel = new OSH.UI.Panel.EntityDatasourcePanel("",{services:this.services, entity:this.entity});

       this.datasourcePanel.onDatasourceChanged = function(datasource) {
           this.entity.dataProviderController.updateDataSource(datasource);
       }.bind(this);

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
        // create corresponding views
        var views = this.viewPanel.views;

        for(var key in views) {
            var currentView = views[key];

            if(currentView.hash !== 0x0000) {
                if (isUndefinedOrNull(currentView.inDialog) || !currentView.inDialog) {
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

                    currentView.attachTo(viewDialog.popContentDiv.id);
                    currentView.inDialog = true;

                    viewDialog.onClose = function() {
                        currentView.inDialog = false;
                    };
                }
            }
        }
        // We can add a group of dataSources and set the options
        this.entity.dataProviderController.addEntity(this.entity);

        // starts streaming
        this.entity.dataProviderController.connectAll();
    },

    createSaveProperty: function () {
        var result = {};

        // Entity information
        this.saveInfo(result);

        // Datasource information
        this.saveDatasources(result);

        // view information
        // new or existing ?
        // store name, type & hash

        this.saveViews(result);

        return result;
    },

    //**************************************************************//
    //*************Saving property**********************************//
    //**************************************************************//

    saveInfo:function(result) {
        // Entity information
        result.infos = {
            id: this.entity.id,
            name : document.getElementById(this.infoPanel.nameTagId).value,
            icon : document.getElementById(this.infoPanel.iconTagId).value,
            description: document.getElementById(this.infoPanel.descriptionTagId).value
        };
    },

    saveDatasources:function(result) {
        var datasourcesProperty = [];
        for(var key in this.datasourcePanel.datasources) {
            var dsProps = {};
            OSH.Utils.copyProperties(this.datasourcePanel.datasources[key].properties,dsProps);
            dsProps.id = this.datasourcePanel.datasources[key].id;

            datasourcesProperty.push(dsProps);
        }
        result.datasources = datasourcesProperty;
    },

    saveViews:function(result) {
        result.views  = [];
        var currentView;

        // iterates over views
        for(var key in this.viewPanel.views) {
            currentView = this.viewPanel.views[key];
            result.views.push(this.saveView(currentView));
        }
    },

    saveView:function(view) {
        // compute view Items infos
        if(!isUndefinedOrNull(view.viewItems)) {
            var currentViewItem;
            var viewItems = [];

            for(var key in view.viewItems) {
                currentViewItem = view.viewItems[key];

                // save only viewItem created using UI
                if(currentViewItem.entityId === this.entity.id) {
                    viewItems.push(this.saveViewItem(currentViewItem));
                }
            }
        }

        return {
            type: view.type,
            hash: view.hash,
            name: view.name,
            container: view.elementDiv.parentNode.id,
            nodeIdx: OSH.Utils.getChildNumber(view.elementDiv),
            display: view.elementDiv.style.display, // for new created views, should be equal to NONE,
            viewItems:viewItems,
            options:view.options,
            viewInstanceType:view.viewInstanceType
        };
    },

    saveViewItem:function(viewItem) {
        var viewItemToSave = {
            name: viewItem.name,
            entityId: viewItem.entityId,
            styler: null
        };

        if (!isUndefinedOrNull(viewItem.styler)) {
            viewItemToSave.styler = this.saveStyler(viewItem.styler);
        }

        return viewItemToSave;
    },

    saveStyler:function(styler) {
        var stylerToSave = {
            properties:{},
            type: OSH.UI.Styler.Factory.getTypeFromInstance(styler)
        };

        for(var property in styler.properties) {
            if(property.endsWith("Func")) {
                stylerToSave[property] = {};

                OSH.Utils.copyProperties(styler.properties[property],stylerToSave[property]);
                stylerToSave[property].handlerStr = styler.properties[property].handler.toSource();
            } else {
                stylerToSave.properties[property] = styler.properties[property];
            }
        }

        return stylerToSave;

        // compute styler
        /*var uiProps = {};
        if(OSH.Utils.hasOwnNestedProperty(styler,"properties.ui")) {
            uiProps = styler.properties.ui;
        }
        var stylerToSave = {
            ui: uiProps,
            type: OSH.UI.Styler.Factory.getTypeFromInstance(styler)
        };

        for(var property in styler.properties) {
            if(property.endsWith("Func")) {
                stylerToSave[property] = {};

                OSH.Utils.copyProperties(styler.properties[property],stylerToSave[property]);
                stylerToSave[property].handlerStr = styler.properties[property].handler.toSource();
            }
        }*/
    },

    restoreSavedProperties:function(properties){
        this.infoPanel.loadInfos(properties.infos);
        this.datasourcePanel.loadDataSourcesProperty(properties.datasources,function(datasourceArray) {

            this.createEntity();

            // asigns saved values
            this.entity.id = properties.infos.id;
            this.entity.name = properties.infos.name;
            this.entity.icon = properties.infos.icon;
            this.entity.description = properties.infos.description;
            this.entity.dataSources = datasourceArray;

            // View panel
            // re-init entity-id
            this.viewPanel.options.entityId = this.entity.id;
            this.viewPanel.options.datasources = this.datasourcePanel.datasources;

            this.viewPanel.loadViews(properties.views);

            // adds and connects datasources
            this.saveEntity();
        }.bind(this));
    }
});