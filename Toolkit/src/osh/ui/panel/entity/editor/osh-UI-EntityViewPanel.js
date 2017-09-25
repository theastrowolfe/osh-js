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
            type: OSH.UI.View.ViewType.MAP
        },{
            name: "Globe 3D (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.CESIUM,
            type: OSH.UI.View.ViewType.MAP
        },{
            name: "Chart (New)",
            viewInstanceType:OSH.UI.ViewFactory.ViewInstanceType.NVD3_LINE_CHART,
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
        //TODO: extract this part into a function
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

                    self.selectElt.add(option);

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

    onAddViewClickHandler:function(event) {
        var dsTabElt = document.getElementById(this.viewContainer);
        var viewProperties = this.selectElt .options[this.selectElt .selectedIndex].properties;

        if(isUndefinedOrNull(viewProperties) || viewProperties.value === "") {
            return;
        }

        this.addView(viewProperties);
    },

    addView:function(viewProperties) {
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

        this.views.push(view);

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
        this.containerElt.appendChild(div);

        // add listeners
        var self = this;

        OSH.EventManager.observeDiv(deleteId,"click",function(event) {
            self.containerElt.removeChild(div);
            var newArr = [];

            for(var i=0;i < self.properties.views.length;i++) {
                if(self.properties.views[i].id !== view.id) {
                    newArr.push(self.properties.views[i]);
                }
            }
            self.properties.views = newArr;
        });

        OSH.EventManager.observeDiv(editId,"click",this.editView.bind(this,view.id));
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

        // gathers Data Sources
        var dsArray = [];

        for(var key in this.options.datasources) {
            var dsClone = this.options.datasources[key];
            dsArray.push(dsClone);
        }


        var cloneView = {};
        OSH.Utils.copyProperties(currentView,cloneView);

        var editView = null;

        var viewProps = {
            view:cloneView,
            datasources:dsArray
        };

        // creates the panel corresponding to the view type
        switch(currentView.type) {
            case OSH.UI.View.ViewType.MAP:  editView = new OSH.UI.Panel.EntityMapEditPanel("",viewProps);break;
            case OSH.UI.View.ViewType.CHART:  editView = new OSH.UI.Panel.EntityChartEditPanel("",viewProps);break;
            case OSH.UI.View.ViewType.VIDEO:  editView = new OSH.UI.Panel.EntityVideoEditPanel("",viewProps);break;
        }

        var editViewDialog = new OSH.UI.Panel.SaveDialogPanel("", {
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
            for(var i=0;i < this.views.length;i++) {
                if (this.views[i].id === editedView.id) {
                    this.views[i] = editedView;
                    break;
                }
            }

            editViewDialog.close();
            editView = null;
        }.bind(this);
    },

    getViewList:function() {
        return document.querySelectorAll(".osh.view");
    }
});