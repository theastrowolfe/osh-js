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


/**
 * @classdesc The abstract object to represent a view.
 * @class
 * @param {Object} parentElementDivId - The parent html element div id to attach/or create the view.
 * @param {string} viewItems - The list of view items
 * @param {string} options - The options
 * @abstract
 */
OSH.UI.View = BaseClass.extend({
    initialize: function (parentElementDivId, viewItems,options) {
        // list of stylers
        this.stylers = [];
        this.contextMenus = [];
        this.viewItems = [];
        this.names = {};
        this.stylerToObj = {};
        this.stylerIdToStyler = {};
        this.lastRec = {};
        this.selectedDataSources = [];
        this.xyz = [];
        this.dataSources = [];
        this.stylerIdToDatasources = {};

        //this.divId = divId;
        this.id = "view-" + OSH.Utils.randomUUID();
        this.name = this.id;

        this.dataSourceId = -1;

        if(!isUndefinedOrNull(options)) {
            this.options = options;

            // sets dataSourceId
            if(!isUndefinedOrNull(options.dataSourceId)) {
                this.dataSourceId = options.dataSourceId;
            }

            if(!isUndefinedOrNull(options.entityId)) {
                this.entityId = options.entityId;
            }

            if(!isUndefinedOrNull(options.name)) {
                this.name = options.name;
            }
        }
        this.css = "osh view ";

        this.cssSelected = "";

        if(typeof(options) !== "undefined" && typeof(options.css) !== "undefined") {
            this.css += options.css;
        }

        if(typeof(options) !== "undefined" && typeof(options.cssSelected) !== "undefined") {
            this.cssSelected = options.cssSelected;
        }

        // inits the view before adding the viewItem
        this.init(parentElementDivId,viewItems,options);

        this.type = this.getType();

        OSH.ViewMap.registerView(this);
    },

    /**
     * Inits the view component.
     * @param parentElementDivId The parent html element object to attach/create the view
     * @param viewItems the list of items to add
     * @param options [TODO]
     * @memberof OSH.UI.View
     */
    init:function(parentElementDivId,viewItems,options) {
        this.elementDiv = document.createElement("div");
        this.elementDiv.setAttribute("id", this.id);
        this.elementDiv.setAttribute("class", this.css);
        this.divId = this.id;

        var div = document.getElementById(parentElementDivId);

        if (typeof(div) === "undefined" || div === null) {
            document.body.appendChild(this.elementDiv);
            this.hide();
            this.container = document.body;
        } else {
            div.appendChild(this.elementDiv);
            this.container = div;
        }

        this.beforeAddingItems(options);

        if (typeof (viewItems) !== "undefined") {
            for (var i =0;i < viewItems.length;i++) {
                this.addViewItem(viewItems[i]);
            }
        }

        if(typeof (options) !== "undefined") {
            if(typeof (options.show) !== "undefined") {
                document.getElementById(this.divId).style.display = (options.show)? "block": "none";
            }
        }
        this.handleEvents();

        // observes the event associated to the dataSourceId
        if(typeof(options) !== "undefined" && typeof(options.dataSourceId) !== "undefined") {
            OSH.EventManager.observe(OSH.EventManager.EVENT.DATA+"-"+options.dataSourceId, function (event) {
                if (event.reset)
                    this.reset(); // on data stream reset
                else
                    this.setData(options.dataSourceId, event.data);
            }.bind(this));
        }

        var self = this;
        var observer = new MutationObserver( function( mutations ){
            mutations.forEach( function( mutation ){
                // Was it the style attribute that changed? (Maybe a classname or other attribute change could do this too? You might want to remove the attribute condition) Is display set to 'none'?
                if( mutation.attributeName === 'style') {
                    self.onResize();

                }
            });
        } );

        // Attach the mutation observer to blocker, and only when attribute values change
        observer.observe( this.elementDiv, { attributes: true } );
    },

    /**
     * @instance
     * @memberof OSH.UI.View
     */
    hide: function() {
        this.elementDiv.style.display = "none";
    },

    /**
     * @instance
     * @memberof OSH.UI.View
     */
    onResize:function() {
    },

    /**
     *
     * @param divId
     * @instance
     * @memberof OSH.UI.View
     */
    attachTo : function(divId) {
        if(typeof this.elementDiv.parentNode !== "undefined") {
            // detach from its parent
            this.elementDiv.parentNode.removeChild(this.elementDiv);
        }
        document.getElementById(divId).appendChild(this.elementDiv);
        if(this.elementDiv.style.display === "none") {
            this.elementDiv.style.display = "block";
        }

        this.onResize();
    },

    /**
     *
     * @param options
     * @instance
     * @memberof OSH.UI.View
     */
    beforeAddingItems: function (options) {

    },

    /**
     *
     * @returns {string|*}
     * @instance
     * @memberof OSH.UI.View
     */
    getId: function () {
        return this.id;
    },

    /**
     *
     * @returns {string|*}
     * @instance
     * @memberof OSH.UI.View
     */
    getDivId: function () {
        return this.divId;
    },

    /**
     *
     * @param dataSourceId
     * @param data
     * @instance
     * @memberof OSH.UI.View
     */
    setData: function(dataSourceId,data) {},

    /**
     * Show the view by removing display:none style if any.
     * @param properties
     * @instance
     * @memberof OSH.UI.View
     */
    show: function(properties) {
    },

    /**
     *
     * @param properties
     * @instance
     * @memberof OSH.UI.View
     */
    shows: function(properties) {
    },

    /**
     * Add viewItem to the view
     * @param viewItem
     * @instance
     * @memberof OSH.UI.View
     */
    addViewItem: function (viewItem) {
        OSH.Asserts.checkIsDefineOrNotNull(viewItem);

        this.viewItems.push(viewItem);
        if (viewItem.hasOwnProperty("styler")) {
            var styler = viewItem.styler;
            this.stylers.push(styler);
            if (viewItem.hasOwnProperty("name")) {
                this.names[styler.getId()] = viewItem.name;
            }
            styler.init(this);
            styler.viewItem = viewItem;
            this.stylerIdToStyler[styler.id] = styler;

            this.observeDatasourceStyler(viewItem,styler);
        }
        if (viewItem.hasOwnProperty("contextmenu")) {
            this.contextMenus.push(viewItem.contextmenu);
        }
        //for(var dataSourceId in styler.dataSourceToStylerMap) {
    },

    observeDatasourceStyler:function(viewItem) {
        OSH.Asserts.checkIsDefineOrNotNull(viewItem);
        OSH.Asserts.checkIsDefineOrNotNull(viewItem.styler);

        var styler = viewItem.styler;

        var ds = styler.getDataSourcesIds();

        if(!( styler.id in this.stylerIdToDatasources)) {
            this.stylerIdToDatasources[styler.id] = [];
        }
        for(var i =0; i < ds.length;i++) {
            var dataSourceId = ds[i];

            var idx = this.stylerIdToDatasources[styler.id].indexOf(dataSourceId);

            if(idx === -1) {
                this.stylerIdToDatasources[styler.id].push(dataSourceId);
                // observes the data come in
                OSH.EventManager.observe(OSH.EventManager.EVENT.DATA + "-" + dataSourceId,this.onReceivedData.bind(this,dataSourceId,viewItem));
                OSH.EventManager.observe(OSH.EventManager.EVENT.SELECT_VIEW,this.onReceivedSelected.bind(this,dataSourceId,viewItem));
                //TODO: critical: freeze the view as well
            }
        }
    },

    onReceivedData:function(datasourceBindId,viewItem,event) {
            var view = OSH.ViewMap.getView(this.id); // get sync view

            // skip data reset events for now
            if (event.reset)
                return;

            // we check selected dataSource only when the selected entity is not set
            var selected = false;
            if (typeof view.selectedEntity !== "undefined") {
                selected = (viewItem.entityId === view.selectedEntity);
            }
            else {
                selected = (view.selectedDataSources.indexOf(datasourceBindId) > -1);
            }

            //TODO: maybe done into the styler?
            viewItem.styler.setData(datasourceBindId, event.data, view, {
                selected: selected
            });

            view.lastRec[datasourceBindId] = event.data;
    },

    onReceivedSelected:function(datasourceBindId,viewItem,event) {
        var view = OSH.ViewMap.getView(this.id); // get sync view

        // we check selected dataSource only when the selected entity is not set
        var selected = false;
        if (typeof event.entityId !== "undefined") {
            selected = (viewItem.entityId === event.entityId);
            view.selectedEntity = event.entityId;
        }
        else {
            selected = (event.dataSourcesIds.indexOf(datasourceBindId) > -1);
            view.selectedDataSources = event.dataSourcesIds;
        }

        if (datasourceBindId in view.lastRec) {
            viewItem.styler.setData(datasourceBindId, view.lastRec[datasourceBindId], view, {
                selected: selected
            });
        }
    },

    /**
     * Remove viewItem to the view
     * @param viewItem
     * @instance
     * @memberof OSH.UI.View
     */
    removeViewItem: function (viewItem) {
        OSH.Asserts.checkIsDefineOrNotNull(viewItem);

        var idx = -1;
        for(var i=0;i < this.viewItems.length;i++) {
            if(this.viewItems[i].id === viewItem.id) {
                idx = i;
                break;
            }
        }

        if (idx > -1) {
            if(!isUndefinedOrNull(viewItem.styler)) {
                var viewItemToRemove = this.viewItems[idx];
                var idxStyler = -1;
                for (var i = 0; i < this.stylers.length; i++) {
                    if (this.stylers[i].id === viewItemToRemove.styler.id) {
                        idxStyler = i;
                        break;
                    }
                }

                if (idxStyler > -1) {
                    viewItem.styler.remove(this);

                    this.stylers.splice(idxStyler, 1);
                    delete this.stylerIdToStyler[viewItemToRemove.styler.id];
                }
            }
            this.viewItems.splice(idx, 1);
        }
    },

    updateViewItem: function (viewItem) {
        OSH.Asserts.checkIsDefineOrNotNull(viewItem);

        for(var i=0;i < this.viewItems.length;i++) {
            if(this.viewItems[i].id === viewItem.id) {
                // update styler
                if(!isUndefinedOrNull(this.viewItems[i].styler)) {
                    this.viewItems[i].styler.update(this);
                    this.removeOldViewItemsDatasource(this.viewItems[i]);
                    // observe datasource
                    this.observeDatasourceStyler(this.viewItems[i]);
                }
                break;
            }
        }
    },

    //TODO: not working. need to remove observationon the old DS
    removeOldViewItemsDatasource:function(viewItem) {
        OSH.Asserts.checkIsDefineOrNotNull(viewItem);
        OSH.Asserts.checkIsDefineOrNotNull(viewItem.styler);

        var currentDsIds = this.stylerIdToDatasources[viewItem.styler.id];
        var newDs = viewItem.styler.getDataSourcesIds();

        for(var key in currentDsIds) {
            var currentDsId = currentDsIds[key];

            if (newDs.indexOf(currentDsId) === -1) {
                // remove observe event
                OSH.EventManager.remove(OSH.EventManager.EVENT.DATA + "-" + currentDsId);
            }
        }
    },

    /**
     * @instance
     * @memberof OSH.UI.View
     */
    handleEvents: function() {
        // observes the selected event
        OSH.EventManager.observe(OSH.EventManager.EVENT.SELECT_VIEW,function(event){
            this.selectDataView(event.dataSourcesIds,event.entityId);
        }.bind(this));

        // observes the SHOW event
        OSH.EventManager.observe(OSH.EventManager.EVENT.SHOW_VIEW,function(event){
            this.show(event);
        }.bind(this));

        // deprecated
        OSH.EventManager.observe(OSH.EventManager.EVENT.ADD_VIEW_ITEM,function(event){
            if(typeof event.viewId !== "undefined" && event.viewId === this.id) {
                this.addViewItem(event.viewItem);
            }
        }.bind(this));

        // new version including the id inside the event id
        OSH.EventManager.observe(OSH.EventManager.EVENT.ADD_VIEW_ITEM+"-"+this.id,function(event){
            this.addViewItem(event.viewItem);
        }.bind(this));

        // new version including the id inside the event id
        OSH.EventManager.observe(OSH.EventManager.EVENT.REMOVE_VIEW_ITEM+"-"+this.id,function(event){
            this.removeViewItem(event.viewItem);
        }.bind(this));

        // new version including the id inside the event id
        OSH.EventManager.observe(OSH.EventManager.EVENT.UPDATE_VIEW_ITEM+"-"+this.id,function(event){
            this.updateViewItem(event.viewItem);
        }.bind(this));

        OSH.EventManager.observe(OSH.EventManager.EVENT.RESIZE+"-"+this.divId,function(event){
            this.onResize();
        }.bind(this));

        var self = this;
        OSH.EventManager.observe(OSH.EventManager.EVENT.GET_OBJECT+"-"+this.divId,function(event){
            OSH.EventManager.fire(OSH.EventManager.EVENT.SEND_OBJECT+"-"+this.divId,{
                object: self
            });
        }.bind(this));
    },

    /**
     * Should be called after receiving osh:SELECT_VIEW event
     * @param $super
     * @param dataSourcesIds
     * @param entitiesIds
     * @instance
     * @memberof OSH.UI.View
     */
    selectDataView: function (dataSourcesIds,entityId) {
        if(typeof this.dataSources !== "undefined") {
            this.selectedDataSources = dataSourcesIds;
            // set the selected entity even if it is undefined
            // this is handled by the setData function
            this.selectedEntity = entityId;
            for (var j = 0; j < this.dataSources.length; j++) {
                this.setData(this.dataSources[j], this.lastRec[this.dataSources[j]]);
            }
        }
    },

    /**
     *
     * @returns {Array}
     * @instance
     * @memberof OSH.UI.View
     */
    getDataSourcesId: function() {
        var res = [];
        if(this.dataSourceId !== -1) {
            res.push(this.dataSourceId);
        }

        // check for stylers
        for(var i = 0; i < this.viewItems.length;i++) {
            var viewItem = this.viewItems[i];
            if (viewItem.hasOwnProperty("styler")) {
                var styler = viewItem.styler;
                res = res.concat(styler.getDataSourcesIds());
            }
        }

        return res;
    },

    /**
     * @instance
     * @memberof OSH.UI.View
     */
    reset: function() {
    },

    getType: function()  {
        return OSH.UI.View.ViewType.UNDEFINED;
    }
});

OSH.UI.View.ViewType = {
    MAP: "map",
    VIDEO: "video",
    CHART: "chart",
    ENTITY_TREE:"entity_tree",
    DISCOVERY : "discovery",
    TASKING: "tasking",
    RANGE_SLIDER:"rangeSlider",
    UNDEFINED: "undefined"
};