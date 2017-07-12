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
 * @classdesc
 * @class OSH.UI.DiscoveryView
 * @type {OSH.UI.View}
 * @augments OSH.UI.View
 * @example
var discoveryView = new OSH.UI.DiscoveryView("discovery-container",{
    services: ["http://sensiasoft.net:8181/"],
    views: [{
        name: 'Video dialog(H264)',
        type : OSH.UI.DiscoveryView.Type.DIALOG_VIDEO_H264
    },{
        name: 'Video dialog(MJPEG)',
        type : OSH.UI.DiscoveryView.Type.DIALOG_VIDEO_MJPEG
    },{
        name: 'Chart dialog',
        type : OSH.UI.DiscoveryView.Type.DIALOG_CHART
    }
    ]
});

//------ More complex example
 var discoveryView = new OSH.UI.DiscoveryView("",{
        services: ["http://sensiasoft.net:8181/"], // server list
        css: "discovery-view",
        dataReceiverController:dataProviderController, // add custom dataProviderController
        swapId: "main-container", // add a divId to swap data for inner dialog
        entities: [androidEntity], // add entities
        views: [{
            name: 'Leaflet 2D Map',
            viewId: leafletMainView.id,
            type : OSH.UI.DiscoveryView.Type.MARKER_GPS
        }, {
            name: 'Cesium 3D Globe',
            viewId: cesiumMainMapView.id,
            type : OSH.UI.DiscoveryView.Type.MARKER_GPS
        },{
            name: 'Video dialog(H264)',
            type : OSH.UI.DiscoveryView.Type.DIALOG_VIDEO_H264
        },{
            name: 'Video dialog(MJPEG)',
            type : OSH.UI.DiscoveryView.Type.DIALOG_VIDEO_MJPEG
        },{
            name: 'Chart dialog',
            type : OSH.UI.DiscoveryView.Type.DIALOG_CHART
        }
        ]
    });
 */
OSH.UI.DiscoveryView = OSH.UI.View.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId,[],properties);

        this.dialogContainer = document.body.id;
        this.swapId = "";
        if(typeof properties !== "undefined") {
            if(typeof properties.dataReceiverController !== "undefined") {
                this.dataReceiverController = properties.dataReceiverController;
            } else {
                this.dataReceiverController = new OSH.DataReceiver.DataReceiverController({
                    replayFactor : 1
                });
                this.dataReceiverController.connectAll();
            }

            if(typeof properties.swapId !== "undefined") {
                this.swapId = properties.swapId;
            }

            if(typeof properties.dialogContainer !== "undefined") {
                this.dialogContainer = properties.dialogContainer;
            }
        }

        this.formTagId = "form-"+OSH.Utils.randomUUID();
        this.serviceSelectTagId = "service-"+OSH.Utils.randomUUID();
        this.offeringSelectTagId = "offering-"+OSH.Utils.randomUUID();
        this.observablePropertyTagId = "obsProperty-"+OSH.Utils.randomUUID();
        this.startTimeTagId = "startTime-"+OSH.Utils.randomUUID();
        this.endTimeTagId = "endTime-"+OSH.Utils.randomUUID();
        this.typeSelectTagId = "type-"+OSH.Utils.randomUUID();
        this.formButtonId = "submit-"+OSH.Utils.randomUUID();
        this.syncMasterTimeId = "syncMasterTime-"+OSH.Utils.randomUUID();
        this.replaySpeedId = "resplaySpeed-"+OSH.Utils.randomUUID();
        this.responseFormatId = "responseFormat-"+OSH.Utils.randomUUID();
        this.bufferingId = "buffering-"+OSH.Utils.randomUUID();

        // add template
        var discoveryForm = document.createElement("form");
        discoveryForm.setAttribute("action","#");
        discoveryForm.setAttribute("id",this.formTagId);
        discoveryForm.setAttribute("class",'discovery-form');

        document.getElementById(this.divId).appendChild(discoveryForm);

        var strVar="";
        strVar += "<ul>";
        strVar += "            <li>";
        strVar += "                <h2>Discovery<\/h2>";
        strVar += "                <span class=\"required_notification\">* Denotes Required Field<\/span>";
        strVar += "            <\/li>";
        strVar += "            <li>";
        strVar += "                <label>Service:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                     <select id=\""+this.serviceSelectTagId+"\" required pattern=\"^(?!Select a service$).*\">";
        strVar += "                         <option value=\"\" disabled selected>Select a service<\/option>";
        strVar += "                     <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li>";
        strVar += "                <label>Offering:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                    <select id=\""+this.offeringSelectTagId+"\" required>";
        strVar += "                        <option value=\"\" disabled selected>Select an offering<\/option>";
        strVar += "                    <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li>";
        strVar += "                <label>Observable Property:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                     <select id=\""+this.observablePropertyTagId+"\" required>";
        strVar += "                         <option value=\"\" disabled selected>Select a property<\/option>";
        strVar += "                     <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li>";
        strVar += "                <label for=\"startTime\">Start time:<\/label>";
        //strVar += "                <input type=\"text\" name=\"startTime\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\" required pattern=\"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)\" />";
        strVar += "                <input id=\""+this.startTimeTagId+"\" type=\"text\" name=\"startTime\" class=\"input-text\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\" required/>";
        strVar += "                <span class=\"form_hint\">YYYY-MM-DDTHH:mm:ssZ<\/span>";
        strVar += "            <\/li>";
        strVar += "            <li>";
        strVar += "                <label for=\"endTime\">End time:<\/label>";
        //strVar += "                <input type=\"text\" name=\"endTime\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\"  required pattern=\"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)\" />";
        strVar += "                <input id=\""+this.endTimeTagId+"\" type=\"text\" name=\"endTime\" class=\"input-text\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\"  required/>";
        strVar += "                <span class=\"form_hint\">YYYY-MM-DDTHH:mm:ssZ<\/span>";
        strVar += "            <\/li>";
        strVar += "            <div class=\"advanced\">";
        strVar += "                 <!--input type=\"checkbox\" class=\"advanced\"><i class=\"fa fa-plus-square-o details-button\" aria-hidden=\"true\"><\/i>&nbsp; Advanced <\/input-->";
        strVar += "                 <input type=\"checkbox\" name=\"advanced\" id=\"advanced\"/><label for=\"advanced\"><i class=\"fa\"></i>Advanced</label>";
        strVar += "                 <div class=\"details\">";
        strVar += "                     <li>";
        strVar += "                         <label for=\"syncMasterTime\">Sync master time:<\/label>";
        strVar += "                         <input id=\""+this.syncMasterTimeId+"\"  class=\"input-checkbox\" type=\"checkbox\" name=\"syncMasterTime\" />";
        strVar += "                     <\/li>";
        strVar += "                     <li>";
        strVar += "                         <label for=\"replaySpeed\">Replay factor:<\/label>";
        strVar += "                         <input id=\""+this.replaySpeedId+"\"  class=\"input-text\" type=\"input-text\" name=\"replaySpeed\" value=\'1\' />";
        strVar += "                     <\/li>";
        strVar += "                     <li>";
        strVar += "                         <label for=\"responseFormat\">Response format<\/label>";
        strVar += "                         <input id=\""+this.responseFormatId+"\"  class=\"input-text\" type=\"input-text\" name=\"responseFormat\" placeholder='\e.g: mp4\'/>";
        strVar += "                     <\/li>";
        strVar += "                     <li>";
        strVar += "                         <label for=\"buffering\">Buffering time (ms)<\/label>";
        strVar += "                         <input id=\""+this.bufferingId+"\"  class=\"input-text\" type=\"input-text\" name=\"buffering\" value=\'1000\'/>";
        strVar += "                     <\/li>";
        strVar += "                     <li>";
        strVar += "                         <label for=\"timeShift\">TimeShift (ms)<\/label>";
        strVar += "                         <input id=\""+this.timeShiftId+"\"  class=\"input-text\" type=\"input-text\" name=\"timeShift\" placeholder=\"e.g: -16000\"/>";
        strVar += "                     <\/li>";
        strVar += "                 <\/div>";
        strVar += "             <\/div>";
        strVar += "            <li>";
        strVar += "                <button id=\""+this.formButtonId+"\" class=\"submit\" type=\"submit\">Add<\/button>";
        strVar += "            <\/li>";
        strVar += "        <\/ul>";

        discoveryForm.innerHTML = strVar;

        // fill service from urls
        if(typeof properties !== "undefined") {
            // add services
            if(typeof properties.services !== "undefined"){
                this.addValuesToSelect(this.serviceSelectTagId,properties.services);
            }
        }

        // add listeners
        OSH.EventManager.observeDiv(this.serviceSelectTagId,"change",this.onSelectedService.bind(this));
        OSH.EventManager.observeDiv(this.offeringSelectTagId,"change",this.onSelectedOffering.bind(this));
        OSH.EventManager.observeDiv(this.formTagId,"submit",this.onFormSubmit.bind(this));
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    onSelectedService : function(event) {
        var serverTag = document.getElementById(this.serviceSelectTagId);
        var option = serverTag.options[serverTag.selectedIndex];

        this.removeAllFromSelect(this.offeringSelectTagId);

        this.oshServer = new OSH.Server({
            url: option.value
        });

        var onSuccessGetCapabilities = function(jsonObj) {
            var startTimeInputTag = document.getElementById(this.startTimeTagId);
            var endTimeInputTag = document.getElementById(this.endTimeTagId);

            var offering=null;

            for(var i=0;i < jsonObj.Capabilities.contents.offering.length;i++) {
                offering = jsonObj.Capabilities.contents.offering[i];
                this.addValueToSelect(this.offeringSelectTagId,offering.name,offering);
            }
        }.bind(this);

        var onErrorGetCapabilities = function(event) {
        };

        this.oshServer.getCapabilities(onSuccessGetCapabilities,onErrorGetCapabilities);
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    onSelectedOffering : function(event) {
        var e = document.getElementById(this.offeringSelectTagId);
        var option = e.options[e.selectedIndex];
        var offering = option.parent;
        this.removeAllFromSelect(this.observablePropertyTagId);

        var startTimeInputTag = document.getElementById(this.startTimeTagId);
        var endTimeInputTag = document.getElementById(this.endTimeTagId);

        // set times
        startTimeInputTag.value = offering.phenomenonTime.beginPosition;

        if(typeof offering.phenomenonTime.endPosition.indeterminatePosition !== "undefined") {
            var d = new Date();
            d.setUTCFullYear(2055);
            endTimeInputTag.value = d.toISOString();
        } else {
            endTimeInputTag.value = offering.phenomenonTime.endPosition;
        }

        // feed observable properties
        for(var i = 0; i  < offering.observableProperty.length;i++) {
            this.addValueToSelect(this.observablePropertyTagId,offering.observableProperty[i],offering);
        }
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    onSelectedType : function(event) {
        var typeTag = document.getElementById(this.typeSelectTagId);
        var tagValue = typeTag.value;
        this.removeAllFromSelect(this.viewSelectTagId);
        for(var i= 0;i  < this.views.length;i++) {
            var currentView = this.views[i];
            if(typeof currentView.type !== "undefined" && currentView.type === tagValue){
                this.addValueToSelect(this.viewSelectTagId,currentView.name,undefined,currentView);
            }
        }
    },

    /**
     *
     * @param event
     * @returns {boolean}
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    onFormSubmit : function(event) {
        event.preventDefault();
        // service
        var serviceTag = document.getElementById(this.serviceSelectTagId);
        var serviceTagSelectedOption = serviceTag.options[serviceTag.selectedIndex];

        // offering
        var offeringTag = document.getElementById(this.offeringSelectTagId);
        var offeringTagSelectedOption = offeringTag.options[offeringTag.selectedIndex];

        // obs property
        var observablePropertyTag = document.getElementById(this.observablePropertyTagId);
        var observablePropertyTagSelectedOption = observablePropertyTag.options[observablePropertyTag.selectedIndex];

        // time
        var startTimeInputTag = document.getElementById(this.startTimeTagId);
        var endTimeInputTag = document.getElementById(this.endTimeTagId);

        // sync master time
        var syncMasterTimeTag = document.getElementById(this.syncMasterTimeId);

        // get values
        var name=offeringTagSelectedOption.parent.name;
        var endPointUrl=serviceTagSelectedOption.value+"sensorhub/sos";
        var offeringID=offeringTagSelectedOption.parent.identifier;
        var obsProp=observablePropertyTagSelectedOption.value;
        var startTime=startTimeInputTag.value;
        var endTime=endTimeInputTag.value;

        endPointUrl = endPointUrl.replace('http://', '');
        var syncMasterTime = syncMasterTimeTag.checked;

        return false;
    },

    /**
     *
     * @param tagId
     * @param objectsArr
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    addObjectsToSelect:function(tagId,objectsArr) {
        var selectTag = document.getElementById(tagId);
        for(var i=0;i < objectsArr.length;i++) {
            var object = objectsArr[i];
            var option = document.createElement("option");
            option.text = object.name;
            option.value = object.name;
            option.object = object;
            selectTag.add(option);
        }
    },

    /**
     *
     * @param tagId
     * @param valuesArr
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    addValuesToSelect:function(tagId,valuesArr) {
        var selectTag = document.getElementById(tagId);
        for(var i=0;i < valuesArr.length;i++) {
            var value = valuesArr[i];
            var option = document.createElement("option");
            option.text = value;
            option.value = value;
            selectTag.add(option);
        }
    },

    /**
     *
     * @param tagId
     * @param value
     * @param parent
     * @param object
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    addValueToSelect:function(tagId,value,parent,object) {
        var selectTag = document.getElementById(tagId);
        var option = document.createElement("option");
        option.text = value;
        option.value = value;
        option.parent = parent;

        if(typeof object !== "undefined") {
            option.object = object;
        }

        if(typeof parent !== "undefined") {
            option.parent = parent;
        }
        selectTag.add(option);
    },

    /**
     *
     * @param tagId
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    removeAllFromSelect:function(tagId) {
        var i;
        var selectTag = document.getElementById(tagId);
        for (i = selectTag.options.length - 1; i > 0; i--) {
            selectTag.remove(i);
        }
    },

    /**
     *
     * @param name
     * @param endPointUrl
     * @param offeringID
     * @param obsProp
     * @param startTime
     * @param endTime
     * @param syncMasterTime
     * @param viewId
     * @param entityId
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    createGPSMarker: function(name,endPointUrl,offeringID,obsProp,startTime,endTime,syncMasterTime,viewId,entityId) {
        var gpsDataSource = new OSH.DataReceiver.LatLonAlt(name, {
            protocol: "ws",
            service: "SOS",
            endpointUrl: endPointUrl,
            offeringID: offeringID,
            observedProperty: obsProp,
            startTime: startTime,
            endTime: endTime,
            replaySpeed: 1,
            syncMasterTime: syncMasterTime,
            bufferingTime: 1000,
            timeShift: -16000
        });

        // create viewItem
        var pointMarker = new OSH.UI.Styler.PointMarker({
            locationFunc : {
                dataSourceIds : [gpsDataSource.id],
                handler : function(rec) {
                    return {
                        x : rec.lon,
                        y : rec.lat,
                        z : rec.alt
                    };
                }
            },
            icon : 'images/cameralook.png',
            iconFunc : {
                dataSourceIds: [gpsDataSource.getId()],
                handler : function(rec,timeStamp,options) {
                    if(options.selected) {
                        return 'images/cameralook-selected.png'
                    } else {
                        return 'images/cameralook.png';
                    }
                }
            }
        });

        // We can add a group of dataSources and set the options
        this.dataReceiverController.addDataSource(gpsDataSource);

        var viewItem = {
            styler :  pointMarker,
            name : name
        };

        if(typeof entityId !== "undefined") {
            viewItem['entityId'] = entityId;
        }

        OSH.EventManager.fire(OSH.EventManager.EVENT.ADD_VIEW_ITEM,{viewItem:viewItem,viewId:viewId});
        OSH.EventManager.fire(OSH.EventManager.EVENT.CONNECT_DATASOURCE,{dataSourcesId:[gpsDataSource.id]});
    },

    /**
     *
     * @param name
     * @param endPointUrl
     * @param offeringID
     * @param obsProp
     * @param startTime
     * @param endTime
     * @param syncMasterTime
     * @param entityId
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    createMJPEGVideoDialog:function(name,endPointUrl,offeringID,obsProp,startTime,endTime,syncMasterTime,entityId) {
        var videoDataSource = new OSH.DataReceiver.VideoMjpeg(name, {
            protocol: "ws",
            service: "SOS",
            endpointUrl: endPointUrl,
            offeringID: offeringID,
            observedProperty: obsProp,
            startTime: startTime,
            endTime: endTime,
            replaySpeed: 1,
            syncMasterTime: syncMasterTime,
            bufferingTime: 1000
        });

        var dialog    =  new OSH.UI.DialogView(this.dialogContainer, {
            draggable: true,
            css: "dialog",
            name: name,
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [videoDataSource.id],
            swapId: this.swapId
        });

        var videoView = new OSH.UI.MjpegView(dialog.popContentDiv.id, {
            dataSourceId: videoDataSource.id,
            css: "video",
            cssSelected: "video-selected",
            name: "Android Video",
            entityId : entityId,
            keepRatio:true
        });

        // We can add a group of dataSources and set the options
        this.dataReceiverController.addDataSource(videoDataSource);

        // starts streaming
        OSH.EventManager.fire(OSH.EventManager.EVENT.CONNECT_DATASOURCE,{dataSourcesId:[videoDataSource.id]});
    },

    /**
     *
     * @param name
     * @param endPointUrl
     * @param offeringID
     * @param obsProp
     * @param startTime
     * @param endTime
     * @param syncMasterTime
     * @param entityId
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    createH264VideoDialog:function(name,endPointUrl,offeringID,obsProp,startTime,endTime,syncMasterTime,entityId) {
        var videoDataSource = new OSH.DataReceiver.VideoH264(name, {
            protocol: "ws",
            service: "SOS",
            endpointUrl: endPointUrl,
            offeringID: offeringID,
            observedProperty: obsProp,
            startTime: startTime,
            endTime: endTime,
            replaySpeed: 1,
            syncMasterTime: syncMasterTime,
            bufferingTime: 1000
        });

        var dialog    =  new OSH.UI.DialogView(this.dialogContainer, {
            draggable: true,
            css: "dialog",
            name: name,
            show:true,
            dockable: false,
            closeable: true,
            connectionIds : [videoDataSource.id],
            swapId: this.swapId,
            keepRatio:true
        });

        var videoView = new OSH.UI.FFMPEGView(dialog.popContentDiv.id, {
            dataSourceId: videoDataSource.getId(),
            css: "video",
            cssSelected: "video-selected",
            name: "Android Video",
            entityId : entityId,
            useWorker:true,
            useWebWorkerTransferableData:true
        });

        // We can add a group of dataSources and set the options
        this.dataReceiverController.addDataSource(videoDataSource);

        // starts streaming
        OSH.EventManager.fire(OSH.EventManager.EVENT.CONNECT_DATASOURCE,{dataSourcesId:[videoDataSource.id]});
    },


    /**
     *
     * @param name
     * @param endPointUrl
     * @param offeringID
     * @param obsProp
     * @param startTime
     * @param endTime
     * @param syncMasterTime
     * @param replayFactor
     * @param responseFormat
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    createJSONDataSource:function(name,endPointUrl,offeringID,obsProp,startTime,endTime,syncMasterTime,replayFactor,responseFormat,buffering) {
        return new OSH.DataReceiver.JSON(name, {
            protocol: "ws",
            service: "SOS",
            endpointUrl: endPointUrl,
            offeringID: offeringID,
            observedProperty: obsProp,
            startTime: startTime,
            endTime: endTime,
            replaySpeed: replayFactor,
            syncMasterTime: syncMasterTime,
            bufferingTime: buffering,
            responseFormat: (typeof responseFormat !== "undefined" && responseFormat !== null) ? responseFormat : undefined
        });
    }
});
