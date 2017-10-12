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

OSH.UI.Panel.EntityViewPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);
    },

    initPanel:function() {
        this.views = [];

        var selectViewId = OSH.Utils.randomUUID();
        var addViewButtonId = OSH.Utils.randomUUID();
        var viewContainer = OSH.Utils.randomUUID();
        var createButtonId = OSH.Utils.randomUUID();

       var selectEltId = OSH.Helper.HtmlHelper.addHTMLListBox(this.divElt,"",[],"Select a view");
       this.selectElt = document.getElementById(selectEltId);

       var buttonElt = document.createElement("button");
       buttonElt.setAttribute("class","submit add-view-button");
       buttonElt.innerHTML = "Add";

       this.containerElt = document.createElement("div");
       this.containerElt.setAttribute("class","view-container");

       this.divElt.appendChild(buttonElt);
       this.divElt.appendChild(this.containerElt);

       OSH.Utils.addCss(this.divElt,"views");

       // listeners
       OSH.EventManager.observeElement(buttonElt,"click",this.onAddViewClickHandler.bind(this));

       // inits
       this.initViews();
    },

    initViews: function() {
        // defines available views that user can create
        // views are associated with an instance type (to create final instance) and global type (abstract one)
        // the name is the one displayed
        var views = [{
            name: "Map 2D (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.LEAFLET,
            type: OSH.UI.View.ViewType.MAP,
            hash: 0x0001
        },{
            name: "Globe 3D (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.CESIUM,
            type: OSH.UI.View.ViewType.MAP,
            hash: 0x0002
        },{
            name: "Chart (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.NVD3_LINE_CHART,
            type: OSH.UI.View.ViewType.CHART,
            hash: 0x0003
        },{
            name: "Video - H264 (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.FFMPEG,
            type: OSH.UI.View.ViewType.VIDEO,
            hash: 0x0004
        },{
            name: "Video - MJPEG (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.MJPEG,
            type: OSH.UI.View.ViewType.VIDEO,
            hash: 0x0005
        }];

        this.removeAllFromSelectElement(this.selectElt);

        for(var key in views) {

            var option = document.createElement("option");
            option.text = views[key].name;
            option.value = views[key].name;
            option.properties = views[key];

            this.selectElt.add(option);
        }

        var self = this;

        // checks for existing views
        // checking for existing views once the DOM has been loaded
        OSH.Helper.HtmlHelper.onDomReady(this.initExistingViews.bind(this));
    },

    initExistingViews:function() {
        var self = this;

        var viewList = this.getViewList();

        for(var key in viewList) {
            var currentViewDiv = viewList[key];
            OSH.EventManager.observe(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id, function (event) {
                var option = document.createElement("option");
                option.text = event.object.name;
                option.value = event.object.name;
                option.properties = {
                    name: event.object.name,
                    type: event.object.type,
                    instance: event.object
                };

                self.selectElt.add(option);

                //if(self.entity.entityId === option.properties.instance.entityId
                var addView = false;

                for (var keyView in event.object.viewItems) {
                    if (event.object.viewItems[keyView].entityId === self.options.entityId) {
                        addView = true;
                        break;
                    }
                }

                if(addView) {
                    self.addView(option.properties);
                }

                OSH.EventManager.remove(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id);
            });

            OSH.EventManager.fire(OSH.EventManager.EVENT.GET_OBJECT + "-" + currentViewDiv.id);
        }
    },

    onAddViewClickHandler:function(event) {
        var dsTabElt = document.getElementById(this.viewContainer);
        var viewProperties = this.selectElt .options[this.selectElt .selectedIndex].properties;

        if(isUndefinedOrNull(viewProperties) || viewProperties.value === "") {
            return;
        }

        this.addView(viewProperties);
    },

    addView:function(viewProperties) {
        // two cases: this is an existing view or this is a view we want to create
        var viewInstance;

        if(isUndefinedOrNull(viewProperties.instance)) {
            // creates the instance
            viewInstance = this.getNewViewInstance(viewProperties);
        } else { // the view already exists
            viewInstance = viewProperties.instance;
            viewInstance.hash = 0x0000;
        }

        this.views.push(viewInstance);

        // adds line to tab
        var lineElt = this.getNewLine(viewInstance.name);

        // appends line to container
        this.containerElt.appendChild(lineElt);

        var editElt = lineElt.querySelectorAll(".control td.edit");
        var deleteElt = lineElt.querySelectorAll(".control td.delete");

        editElt = editElt[editElt.length-1];
        deleteElt = deleteElt[deleteElt.length-1];

        // handlers
        OSH.EventManager.observeElement(editElt,"click",this.editHandler.bind(this,lineElt,viewInstance));
        OSH.EventManager.observeElement(deleteElt, "click", this.deleteHandler.bind(this, lineElt, viewInstance));

        return viewInstance;
    },

    getViewList:function() {
        return document.querySelectorAll(".osh.view");
    },

    getNewViewInstance:function(properties) {

        // gets view type
        var viewInstanceType = properties.viewInstanceType;

        // gets default view properties
        // gets default view property
        var defaultViewProperties;

        if(isUndefinedOrNull(properties.options)) {
            defaultViewProperties = OSH.UI.ViewFactory.getDefaultViewProperties(viewInstanceType);
            defaultViewProperties.name = properties.name;
        } else {
            defaultViewProperties = properties.options;
        }

        // creates the panel corresponding to the view type
        var viewInstance = OSH.UI.ViewFactory.getDefaultViewInstance(viewInstanceType, defaultViewProperties);
        viewInstance.hash = properties.hash;

        return viewInstance;
    },

    getNewLine:function(viewName) {
        // creates the line
        var lineElt = document.createElement('div');
        lineElt.setAttribute("id","LineView"+OSH.Utils.randomUUID());
        lineElt.setAttribute("class","ds-line");

        var spanElt = document.createElement("span");
        spanElt.setAttribute("class","line-left");
        spanElt.innerHTML = ""+viewName;

        var tableElt = document.createElement("table");
        tableElt.setAttribute("class","control line-right");

        var trElt = document.createElement("tr");

        var editTdElt = document.createElement("td");
        editTdElt.setAttribute("class","fa fa-2x fa-pencil-square-o edit");
        editTdElt.setAttribute("aria-hidden","true");

        var deleteTdElt = document.createElement("td");
        deleteTdElt.setAttribute("class","fa fa-2x fa-trash-o delete");
        deleteTdElt.setAttribute("aria-hidden","true");

        var divElt = document.createElement("div");
        divElt.setAttribute("style","clear: both;");

        // builds table
        trElt.appendChild(editTdElt);
        trElt.appendChild(deleteTdElt);
        tableElt.appendChild(trElt);

        // builds line
        lineElt.appendChild(spanElt);
        lineElt.appendChild(tableElt);
        lineElt.appendChild(divElt);

        return lineElt;
    },

    editHandler:function(lineElt,viewInstance) {
        var viewInstance = this.getViewById(viewInstance.id);
        // get current viewInstance

        OSH.Asserts.checkIsDefineOrNotNull(viewInstance);

        // gathers Data Sources
        var dsArray = [];

        for(var key in this.options.datasources) {
            var dsClone = this.options.datasources[key];
            dsArray.push(dsClone);
        }

        var cloneViewInstance = {};
        OSH.Utils.copyProperties(viewInstance,cloneViewInstance);

        var options = {
            view:cloneViewInstance,
            datasources : dsArray,
            entityId:this.options.entityId
        };

        // creates the panel corresponding to the view type
        var editView;
        switch(viewInstance.type) {
            case OSH.UI.View.ViewType.MAP:  editView = new OSH.UI.Panel.EntityMapEditPanel("",options);break;
            case OSH.UI.View.ViewType.CHART:  editView = new OSH.UI.Panel.EntityChartEditPanel("",options);break;
            case OSH.UI.View.ViewType.VIDEO:  {
                if(viewInstance instanceof OSH.UI.MjpegView) {
                    editView = new OSH.UI.Panel.EntityMJPEGVideoEditPanel("", options);
                } else {
                    editView = new OSH.UI.Panel.EntityVideoEditPanel("", options);
                }
                break;
            }
            default:break;
        }

        OSH.Asserts.checkIsDefineOrNotNull(editView);

        var editViewDialog = new OSH.UI.Panel.SaveDialogPanel("", {
            draggable: true,
            css: "dialog-edit-view", //TODO: create unique class for all the views
            name: "Edit "+cloneViewInstance.name+" View",
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [],
            destroyOnClose:true,
            modal:true
        });

        editView.attachTo(editViewDialog.popContentDiv.id);

        editViewDialog.onSave = function() {
            var clonedView = editView.getView();

            lineElt.querySelector("span.line-left").innerHTML = clonedView.name;

            // finds the view instance and updates i
            var i;

            for(i=0;i < this.views.length;i++) {
                if (this.views[i].id === clonedView.id) {
                    var viewProperties =  editView.getProperties();

                    this.views[i].viewItemsToAdd = clonedView.viewItemsToAdd;
                    this.views[i].viewItemsToRemove = clonedView.viewItemsToRemove;
                    this.views[i].updateProperties(viewProperties);
                    if(OSH.Utils.hasOwnNestedProperty(viewProperties,"name")) {
                        //TODO: dupplicated values, should only handle 1 property
                        this.views[i].name = viewProperties.name;
                        this.views[i].options.name = viewProperties.name;
                        // updates dialog name
                        if (this.views[i].hash !== 0x0000 && !isUndefinedOrNull(this.views[i].dialog)) { // this is not an existing view
                            var parentDialogElt = OSH.Utils.getSomeParentTheClass(this.views[i].elementDiv, "dialog");
                            var spanElt = parentDialogElt.querySelector(".header").querySelector("span");
                            if (!isUndefinedOrNull(spanElt)) {
                                spanElt.innerHTML = viewProperties.name;
                            }
                            if(!isUndefinedOrNull(viewProperties.keepRatio)) {
                                var popOverElt = parentDialogElt.querySelector(".pop-over");
                                var containsKeepRatio = OSH.Utils.containsCss(popOverElt,"keep-ratio-w");
                                if(containsKeepRatio && !viewProperties.keepRatio) {
                                    OSH.Utils.removeCss(popOverElt,"keep-ratio-w");
                                } else if(!containsKeepRatio && viewProperties.keepRatio) {
                                    OSH.Utils.addCss(popOverElt,"keep-ratio-w");
                                }
                            }
                        }
                    }

                    break;
                }
            }

            editViewDialog.close();
            editView = null;

            //TODO: switch container or create a new one(dialog) if needed

            this.checkViewItems(this.views[i]);

        }.bind(this);

    },

    deleteHandler:function(lineElt,viewInstance) {
        // get current viewInstance
        var viewInstance = this.getViewById(viewInstance.id);

        OSH.Asserts.checkIsDefineOrNotNull(viewInstance);

        this.containerElt.removeChild(lineElt);
        var newArr = [];

        for(var i=0;i < this.views.length;i++) {
            if(this.views[i].id !== viewInstance.id) {
                newArr.push(this.views[i]);
            }
        }
        this.views = newArr;

        // delete corresponding viewItem
        var currentViewItem;
        for(var i = 0;i < viewInstance.viewItems.length;i++) {
            currentViewItem = viewInstance.viewItems[i];
            if(currentViewItem.entityId === this.options.entityId) {
                viewInstance.removeViewItem(currentViewItem);
            }
        }
        // destroy element
        if(viewInstance.hash !== 0x0000) {
            OSH.Utils.destroyElement(viewInstance.elementDiv);
        }
    },

    checkViewItems:function(view) {
        // updates/add view item
        if(!isUndefinedOrNull(view.viewItemsToAdd)) {
            for (var j = 0; j < view.viewItemsToAdd.length; j++) {
                var viewItemToAdd = view.viewItemsToAdd[j];

                view.addViewItem(viewItemToAdd);
            }
            view.viewItemsToAdd = [];
        }

        // DELETE
        if(!isUndefinedOrNull(view.viewItemsToRemove)) {
            for (var j = 0; j < view.viewItemsToRemove.length; j++) {
               var viewItemToRemove = view.viewItemsToRemove[j];
                view.removeViewItem(viewItemToRemove);
            }
            view.viewItemsToRemove = [];
        }

        // update all viewItems
        for (var j = 0; j < view.viewItems.length; j++) {
            var viewItemToUpdate = view.viewItems[j];
            view.updateViewItem(viewItemToUpdate);
        }
    },

    reset:function() {
        OSH.Helper.HtmlHelper.removeAllNodes(this.containerElt);
        this.views = [];
    },

    getViewById:function(id) {
        var view;

        for(i=0;i < this.views.length;i++) {
            if (this.views[i].id === id) {
                view = this.views[i];
                break;
            }
        }

        return view;
    },

    //**************************************************************//
    //*************Restoring view **********************************//
    //**************************************************************//

    /**
     * load views from saved data
     * @param viewPropertiesArray
     */
    loadViews:function(viewPropertiesArray) {
        this.reset();
        var currentProperty;

        var existingViewList = this.getViewList();
        for(var key in viewPropertiesArray) {
            currentProperty = viewPropertiesArray[key];
            if(currentProperty.hash === 0x000) {
                // existing view
                for(var i=0;i < existingViewList.length;i++) {
                    this.restoringExistingView(existingViewList[i],currentProperty);
                }
            } else {
                //TODO: case where the view is a new view
                this.restoringDialogView(existingViewList[i],currentProperty);
            }
        }
    },

    restoringDialogView:function(currentViewDiv,properties) {
        var viewInstance = this.addView({
            name: properties.name,
            type: properties.type,
            hash: properties.hash,
            viewInstanceType:properties.viewInstanceType,
            options:properties.options
        });

        this.restoringView(viewInstance,currentViewDiv,properties);
    },

    restoringExistingView:function(currentViewDiv,properties) {
        OSH.EventManager.observe(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id, function (event) {
            var viewInstance = event.object;
            var nodeIndex = OSH.Utils.getChildNumber(viewInstance.elementDiv);
            if(viewInstance.type === properties.type &&
                nodeIndex === properties.nodeIdx &&
                viewInstance.elementDiv.parentNode.id === properties.container) {
                this.restoringView(viewInstance, currentViewDiv, properties);

                this.addView({
                    name: properties.name,
                    type: properties.type,
                    instance: viewInstance,
                    hash: properties.hash
                });
            }
            OSH.EventManager.remove(OSH.EventManager.EVENT.SEND_OBJECT + "-" + currentViewDiv.id);
        }.bind(this));

        OSH.EventManager.fire(OSH.EventManager.EVENT.GET_OBJECT + "-" + currentViewDiv.id);
    },

    restoringView:function(viewInstance,currentViewDiv,properties) {
        //--- Stylers
        for(var key in properties.viewItems) {
            var props = this.restoringStyler(properties.viewItems[key]);
            viewInstance.addViewItem(props);
        }
    },

    restoringStyler:function(currentViewItemProps) {
        var currentViewStylerProps = currentViewItemProps.styler;
        var stylerInstance = OSH.UI.Styler.Factory.getNewInstanceFromType(currentViewStylerProps.type);

        OSH.Utils.copyProperties(currentViewStylerProps,stylerInstance,false);

        // re-create styler function from UI selection
        if(OSH.Utils.hasOwnNestedProperty(stylerInstance,"properties.ui")) {
            for (var property in stylerInstance.properties) {
                if(property.endsWith("Func")) {
                    var fnProperty = this.restoringStylerFunction(property,stylerInstance.properties[property], stylerInstance.properties.ui);
                    stylerInstance.updateProperties(fnProperty);
                }
            }
        }

        return {
            name: currentViewItemProps.name,
            entityId: currentViewItemProps.entityId,
            styler:stylerInstance
        };
    },

    restoringStylerFunction:function(fnName,fnProperty,uiProperty) {
        var regex = /(blob:[^']*)'/g;
        var matches;
        var funcStr = fnProperty.handlerStr;

        while ((matches = regex.exec(fnProperty.handlerStr)) !== null) {
            var result = [];
            OSH.Utils.searchPropertyByValue(
                uiProperty,
                matches[1],
                result);
            if(!isUndefinedOrNull(result) && result.length > 0) {
                // regenerate a blob from binary string and replace corresponding function
                var blobUrl = OSH.Utils.binaryStringToBlob(result[0].binaryString);
                funcStr = funcStr.replace(matches[1],blobUrl);
                result[0].url = blobUrl; // TODO: should find a best way to change dynamically the blob url
            }
        }

        var func = OSH.UI.Styler.Factory.buildFunctionFromSource(
            fnProperty.dataSourceIds,
            fnName,
            funcStr);

        return func;
    }
    /** End restoring view **/
});