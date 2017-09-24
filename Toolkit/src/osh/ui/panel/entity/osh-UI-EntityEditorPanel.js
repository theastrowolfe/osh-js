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

OSH.UI.EntityEditorPanel = OSH.UI.Panel.extend({

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

            if(!isUndefinedOrNull(properties.entity)) {
                this.entity = properties.entity;
            }
        }

        if(isUndefinedOrNull(this.entity)) {
            // creates new entity
            this.entity = {
                id: "entity-" + OSH.Utils.randomUUID()
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

        // inits properties
        this.properties = {
            datasources : {},
            views : []
        };

        // inits views
        this.initViews();

        // inits datasources
        this.initDatasources();

    },

    createFilePanel:function() {
        var divElt = document.createElement("div");

        // LOAD part
        var loadDivElt = document.createElement("div");

        // adds button
        var loadButtonElt = document.createElement("button");
        loadButtonElt.setAttribute("id",OSH.Utils.randomUUID());
        loadButtonElt.setAttribute("class","submit load-button");
        loadButtonElt.setAttribute("disabled",""); // disabled by default

        loadButtonElt.innerHTML = "Load";

        loadDivElt.appendChild(loadButtonElt);

        // adds input field
        var inputFileEltId = OSH.Helper.HtmlHelper.addFileChooser(loadDivElt);

        var self = this;

        OSH.Helper.HtmlHelper.onDomReady(function(){
            var nextElt = document.getElementById("text-"+inputFileEltId);
            nextElt.className += " load-settings ";

            // listeners
            var inputFileElt = document.getElementById(inputFileEltId);
            self.addListener(inputFileElt, "change", self.inputFileHandlerAsText.bind(inputFileElt,function(result) {
                self.enableElt(loadButtonElt.id);

                self.loadProperties(result.data);
            }));
        });

        // SAVE part
        var divSaveElt = document.createElement("div");
        divSaveElt.setAttribute("class","save");

        // adds button
        var saveButtonElt = document.createElement("button");
        saveButtonElt.setAttribute("id",OSH.Utils.randomUUID());
        saveButtonElt.setAttribute("class","submit load-button");

        saveButtonElt.innerHTML = "Save";

        divSaveElt.appendChild(saveButtonElt);

        // adds input field
        var defaultName = "entity-properties.json";
        var inputTextSaveEltId = OSH.Helper.HtmlHelper.addInputText(divSaveElt,null,defaultName,"filename.json");


        OSH.Helper.HtmlHelper.onDomReady(function() {
            var inputTextElt = document.getElementById(inputTextSaveEltId);
            self.addListener(saveButtonElt, "click", function (evt) {
                var inputTextValue = inputTextElt.value;
                var fileName = defaultName;

                if(!isUndefinedOrNull(inputTextValue) && inputTextValue !== "") {
                    fileName = inputTextValue;
                }

               self.saveProperties(fileName);
            });
        });

        divElt.appendChild(loadDivElt);
        divElt.appendChild(divSaveElt);
        return divElt;
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

        var divContainer = document.createElement("div");
        this.divDSContainerId = OSH.Utils.randomUUID();
        divContainer.setAttribute("id",this.divDSContainerId);
        divContainer.setAttribute("class","datasource-container");

        // listeners
        OSH.EventManager.observeDiv(this.addDsButtonId,"click",this.onAddDataSourceButtonClickHandler.bind(this));

        var dsDiv = document.createElement("div");
        dsDiv.appendChild(buttonElt);
        dsDiv.appendChild(divContainer);
        return dsDiv;
    },

    createViewPanel: function() {
        this.selectViewId = OSH.Utils.randomUUID();
        this.addViewButtonId = OSH.Utils.randomUUID();
        this.viewContainer = OSH.Utils.randomUUID();
        this.createButtonId = OSH.Utils.randomUUID();

        var buttonName = "Save";

        var strVar = "      <div class=\"select-style\">";
        strVar += "         <select id=\""+this.selectViewId+"\">";
        strVar += "            <option value=\"\" disabled selected>Select a view<\/option>";
        strVar += "         <\/select>";
        strVar += "      <\/div>";
        strVar += "      <button id=\""+this.addViewButtonId+"\" class=\"submit add-view-button\">Add<\/button>";
        strVar += "      <div id=\""+this.viewContainer+"\" class=\"view-container\"><\/div>";
        strVar += "      <div class=\"horizontal-line\"><\/div>";
        strVar += "      <div class=\"create\">";
        strVar += "         <button id=\""+this.createButtonId+"\" class=\"submit\">"+buttonName+"<\/button>";
        strVar += "      </div>";

        var viewDiv = document.createElement("div");
        viewDiv.innerHTML = strVar;

        viewDiv.setAttribute("class","views");
        // listeners
        OSH.EventManager.observeDiv(this.addViewButtonId,"click",this.onAddViewClickHandler.bind(this));
        OSH.EventManager.observeDiv(this.createButtonId,"click",this.createEntity.bind(this));

        return viewDiv;
    },

    onAddDataSourceButtonClickHandler: function(event) {
        // init discovery view
        var discoveryView = new OSH.UI.DiscoveryView("",{
            services: this.services
        });

        discoveryView.onAddHandler = this.addDataSource.bind(this);

        var discoveryDialog = new OSH.UI.DialogPanel("", {
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
        // defines available views that user can create
        // views are associated with an instance type (to create final instance) and global type (abstract one)
        // the name is the one displayed
        var views = [{
            name: "Map 2D (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.LEAFLET,
            type: OSH.UI.View.ViewType.MAP
        },{
            name: "Globe 3D (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.CESIUM,
            type: OSH.UI.View.ViewType.MAP
        },{
            name: "Chart (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.NVD3_CURVE_CHART,
            type: OSH.UI.View.ViewType.CHART
        },{
            name: "Video - H264 (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.FFMPEG,
            type: OSH.UI.View.ViewType.VIDEO
        },{
            name: "Video - MJPEG (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.MJPEG,
            type: OSH.UI.View.ViewType.VIDEO
        }];

        var selectViewTag = document.getElementById(this.selectViewId);
        this.removeAllFromSelect(this.selectViewId);

        for(var key in views) {

            var option = document.createElement("option");
            option.text = views[key].name;
            option.value = views[key].name;
            option.properties = views[key];

            selectViewTag.add(option);
        }

        var self = this;

        // checks for existing views
        var checkExistingViews = function() {
            var viewList = self.getViewList();

            for(var key in viewList) {
                var currentViewDiv = viewList[key];
                OSH.EventManager.observe(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id, function (event) {
                    var option = document.createElement("option");
                    option.text = event.object.name;
                    option.value = event.object.name;
                    option.properties = {
                        name: event.object.name,
                        type: event.object.type,
                        instance : event.object
                    };

                    selectViewTag.add(option);

                    OSH.EventManager.remove(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id);

                    var addToView = false;

                    if(!isUndefinedOrNull(self.entity)) {
                        if(!isUndefinedOrNull(event.object.viewItems)) {

                            // case where one of the viewItem might be concerned by the entity
                            for(var key in event.object.viewItems) {
                                if(event.object.viewItems[key].entityId === self.entity.id){
                                    addToView = true;
                                    break;
                                }
                            }
                        } else if(!isUndefinedOrNull(event.object.entityId) &&
                            event.object.entityId === self.entity.id){
                            addToView = true;
                        }

                    }
                    if(addToView) {
                        self.addView(option.properties);
                    }
                });

                OSH.EventManager.fire(OSH.EventManager.EVENT.GET_OBJECT + "-" + currentViewDiv.id);
            }
        };

        // checking for existing views once the DOM has been loaded
        OSH.Helper.HtmlHelper.onDomReady(checkExistingViews);
    },

    initDatasources: function() {
        if(!isUndefinedOrNull(this.entity.datacontroller)) {
            for(var key in this.entity.dataSources){
                var ds = this.entity.datacontroller.getDataSource(this.entity.dataSources[key]);
                this.addDataSource(ds);
            }
        }
    },

    saveProperties: function(fileName) {
        var dataToSave = {
            test: "someValue"
        };

        try {
            var blob = new Blob([JSON.stringify(dataToSave)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, fileName);
        } catch(exception) {
            throw new OSH.Exception.Exception("Cannot save the data as file: "+fileName);
        }

    },

    loadProperties : function(textData) {
        try{
            var jsonProperties = JSON.parse(textData);
            console.log(jsonProperties);
        } catch(exception) {
            throw new OSH.Exception.Exception("Cannot convert '"+result.file.name+"' into JSON: "+exception);
        }
    },

    editDataSource:function(dataSource) {
        this.properties.datasources[dataSource.id] = dataSource;

        document.getElementById("ds-name-"+dataSource.id).innerHTML = dataSource.name;

        this.buildDSResultTemplate(this.properties.datasources[dataSource.id]);
    },

    buildDSResultTemplate:function(dataSource) {
        // get result template from datasource
        var server = new OSH.Server({
            url: "http://" + dataSource.properties.endpointUrl
        });

        var self = this;
        // offering, observedProperty
        server.getResultTemplate(dataSource.properties.offeringID,dataSource.properties.observedProperty, function(jsonResp){
            dataSource.resultTemplate = self.buildDSStructure(dataSource,jsonResp);
        },function(error) {
            // do something
        });
    },

    addDataSource:function(dataSource) {

        this.nbDatasources++;
        this.properties.datasources[dataSource.id] = dataSource;

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

        document.getElementById(this.divDSContainerId).appendChild(div);

        // add listeners
        var self = this;

        OSH.EventManager.observeDiv(deleteId,"click",function(event) {
            div.parentNode.removeChild(div);
            delete self.properties.datasources[dataSource.id];
            self.nbDatasources--;
        });

        OSH.EventManager.observeDiv(editId,"click",function(event) {
            // init discovery view
            var discoveryView = new OSH.UI.DiscoveryView("",{
                services: self.services
            });

            discoveryView.onEditHandler = self.editDataSource.bind(self);

            var discoveryDialog = new OSH.UI.DialogPanel("", {
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
            discoveryView.initDataSource(self.properties.datasources[dataSource.id]);
        });

        this.buildDSResultTemplate(dataSource);
    },

    onAddViewClickHandler:function(event) {
        var dsTabElt = document.getElementById(this.viewContainer);
        var selectedViewTag = document.getElementById(this.selectViewId);
        var viewProperties = selectedViewTag.options[selectedViewTag.selectedIndex].properties;

        if(isUndefinedOrNull(viewProperties) || viewProperties.value === "") {
            return;
        }

        this.addView(viewProperties);
    },

    addView:function(viewProperties) {
        var dsTabElt = document.getElementById(this.viewContainer);
        var lineDivId = "LineView"+OSH.Utils.randomUUID();

        var view = {};

        // two cases: this is an existing view or this is a view we want to create
        if(isUndefinedOrNull(viewProperties.instance)) {
            view = {
                name: viewProperties.name,
                id: OSH.Utils.randomUUID(),
                container: "",
                datasource: null,
                lineDivId:lineDivId,
                viewInstanceType:viewProperties.viewInstanceType,
                type: viewProperties.type,
                viewItems:[]
            };
        } else {

            // transform the instance into properties to be edited/saved/loaded
            view = {
                name: viewProperties.instance.name,
                id: viewProperties.instance.id,
                container: document.getElementById(viewProperties.instance.divId).parentNode.id,
                datasource: viewProperties.instance.datasource,
                lineDivId:lineDivId,
                type: viewProperties.instance.getType(),
                viewItems:viewProperties.instance.viewItems,
                instance:viewProperties.instance
            };
        }

        this.properties.views.push(view);

        // creates the line
        var div = document.createElement('div');
        div.setAttribute("id",lineDivId);
        div.setAttribute("class","ds-line");

        var deleteId = OSH.Utils.randomUUID();
        var editId = OSH.Utils.randomUUID();

        var strVar = "<span class=\"line-left\">"+view.name+"<\/span>";
        strVar += "   <table class=\"control line-right\">";
        strVar += "      <tr>";
        strVar += "         <td><i class=\"fa fa-2x fa-pencil-square-o edit\" aria-hidden=\"true\" id=\""+editId+"\"><\/i><\/td>";
        strVar += "         <td><i class=\"fa fa-2x fa-trash-o delete\" aria-hidden=\"true\" id=\""+deleteId+"\"><\/i><\/td>";
        strVar += "      <\/tr>";
        strVar += "   <\/table>";
        strVar += "<\/div>";
        strVar += "<div style=\"clear: both;\"><\/div>";

        div.innerHTML = strVar;

        // adds line to tab
        dsTabElt.appendChild(div);

        // add listeners
        var self = this;

        OSH.EventManager.observeDiv(deleteId,"click",function(event) {
            dsTabElt.removeChild(div);
            // enable view select
            self.enableElt(self.selectViewId);
            self.enableElt(self.addViewButtonId);

            // enable create button
            //self.disableElt(self.createButtonId);

            var newArr = [];

            for(var i=0;i < self.properties.views.length;i++) {
                if(self.properties.views[i].id !== view.id) {
                    newArr.push(self.properties.views[i]);
                }
            }
            self.properties.views = newArr;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editView.bind(this,view.id));

        // enable create button
        this.enableElt(this.createButtonId);
    },

    editView:function(viewId,event) {
        var currentView = null;
        // finds the view instance and updates it
        for(var i=0;i < this.properties.views.length;i++) {
            if (this.properties.views[i].id === viewId) {
                currentView = this.properties.views[i];
                break;
            }
        }

        // gathers Data Sources
        var dsArray = [];

        for(var key in this.properties.datasources) {
            var dsClone = this.properties.datasources[key];
            dsArray.push(dsClone);
        }


        var cloneView = {};
        OSH.Utils.copyProperties(currentView,cloneView);

        var editView = null;
        var entityId = this.entity.id;

        var viewProps = {
            view:cloneView,
            datasources:dsArray,
            entityId:entityId
        };

        // creates the panel corresponding to the view type
        switch(currentView.type) {
            case OSH.UI.View.ViewType.MAP:  editView = new OSH.UI.EntityMapEditPanel("",viewProps);break;
            case OSH.UI.View.ViewType.CHART:  editView = new OSH.UI.EntityChartEditPanel("",viewProps);break;
            case OSH.UI.View.ViewType.VIDEO:  editView = new OSH.UI.EntityVideoEditPanel("",viewProps);break;
        }

        var editViewDialog = new OSH.UI.SaveDialogPanel("", {
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

             document.getElementById(editedView.lineDivId).querySelector("span.line-left").innerHTML = editedView.name;
             // finds the view instance and updates it
             for(var i=0;i < this.properties.views.length;i++) {
                 if (this.properties.views[i].id === editedView.id) {
                     this.properties.views[i] = editedView;
                     break;
                 }
             }

             editViewDialog.close();
             editView = null;
        }.bind(this);
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

           // updates/add view item
           if(!isUndefinedOrNull(currentView.viewItemsToAdd)) {
                for(var j=0;j < currentView.viewItemsToAdd.length;j++){
                   /* switch(currentView.viewItemsToAdd[i].action) {
                        case "add": {
                            var viewItemToAdd = currentView.viewItemsToAdd[i];
                            //currentView.instance.viewItems.splice(i, 1);

                            OSH.EventManager.fire(OSH.EventManager.EVENT.ADD_VIEW_ITEM + "-" + currentView.instance.id, {
                                viewItem: viewItemToAdd
                            });
                        }
                            break;
                        case "update":
                            break; //TODO: update a viewItem
                        case "remove":
                            break; //TODO: remove a viewItem
                    }*/

                    var viewItemToAdd = currentView.viewItemsToAdd[j];

                    OSH.EventManager.fire(OSH.EventManager.EVENT.ADD_VIEW_ITEM + "-" + currentView.instance.id, {
                        viewItem: viewItemToAdd
                    });
                }
               currentView.viewItemsToAdd = [];
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
    },

    getViewList:function() {
        return document.querySelectorAll(".osh.view");
    },

    createViewNoViewItems:function(currentView,viewInstance,newEntity) {
        if (currentView.container.toLowerCase() === "dialog") {
            var viewDialog = new OSH.UI.DialogPanel("", {
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
            var viewDialog = new OSH.UI.DialogPanel("", {
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
    }
});