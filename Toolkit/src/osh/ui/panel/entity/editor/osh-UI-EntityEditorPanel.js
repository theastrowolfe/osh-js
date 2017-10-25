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

        entityEditor.appendChild(this.tabPanel.elementDiv);
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
        return filePanel.elementDiv;
    },

    createInfoPanel:function() {
        this.infoPanel = new OSH.UI.Panel.EntityInfoPanel();
        return this.infoPanel.elementDiv;
    },

    createDSPanel:function() {
       this.datasourcePanel = new OSH.UI.Panel.EntityDatasourcePanel("",{services:this.services, entity:this.entity});

       this.datasourcePanel.onDatasourceChanged = function(datasource) {
           this.entity.dataProviderController.updateDataSource(datasource);
       }.bind(this);

       return this.datasourcePanel.elementDiv;
    },

    createViewPanel: function() {
        this.viewPanel = new OSH.UI.Panel.EntityViewPanel("",{
            datasources:this.datasourcePanel.datasources,
            entityId:this.entity.id
        });

        return this.viewPanel.elementDiv;
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

    saveEntity:function() {
        // create corresponding views
        var views = this.viewPanel.views;

        var menuItems = [];

        for(var key in views) {
            var currentView = views[key];

            var viewId = currentView.id;

            if(currentView.hash !== 0x0000) {
                this.saveDialog(currentView);
            }

            menuItems.push({
                name: currentView.name,
                viewId: viewId,
                css: "fa fa-video-camera"
            });
        }

        if(menuItems.length > 0) {
            var menuId = "menu-"+OSH.Utils.randomUUID();
            var menu = new OSH.UI.ContextMenu.StackMenu({id: menuId ,groupId: "menu-"+OSH.Utils.randomUUID(),items : menuItems});

            for(var i = 0;i < views.length;i++) {
                for(var j=0;j < views[i].viewItems.length;j++) {
                    views[i].viewItems[j].contextMenuId = menuId;
                }
            }
        }

        // update datasources
        this.entity.dataSources = Object.values(this.datasourcePanel.datasources);

        // We can add a group of dataSources and set the options
        this.entity.dataProviderController.addEntity(this.entity);

        // starts streaming
        this.entity.dataProviderController.connectAll();
    },

    saveDialog:function(view){
        if (isUndefinedOrNull(view.dialog) || !view.dialog.in) {
            var viewDialog = new OSH.UI.Panel.DialogPanel("", {
                draggable: true,
                css: "app-dialog", //TBD into edit view
                name: view.name,
                show: true,
                dockable: false,
                closeable: true,
                connectionIds: [],//TODO
                destroyOnClose: false,
                modal: false,
                keepRatio: (!isUndefinedOrNull(view.options.keepRatio)) ? view.options.keepRatio : false
            });

            view.attachToElement(viewDialog.contentElt);
            view.dialog = {
                in : true,
                closed:false
            };

            viewDialog.onClose = function() {
                view.dialog.closed = true;
            };

            viewId=viewDialog.id;
        } else if(view.dialog.closed){
            // show dialog
            var parentDialog = OSH.Utils.getSomeParentTheClass(view.elementDiv,"dialog");
            if(!isUndefinedOrNull(parentDialog)) {
                viewId = parentDialog.id;
                OSH.EventManager.fire(OSH.EventManager.EVENT.SHOW_VIEW, {
                    viewId: viewId
                });
            }
        }
    },

    //**************************************************************//
    //*************Saving property**********************************//
    //**************************************************************//

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
            stylerToSave.properties[property] = {};
            if(property.endsWith("Func")) {
                OSH.Utils.copyProperties(styler.properties[property],stylerToSave.properties[property]);
                stylerToSave.properties[property].handlerStr = styler.properties[property].handler.toSource();
            } else {
                stylerToSave.properties[property] = styler.properties[property];
            }
        }

        return stylerToSave;

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