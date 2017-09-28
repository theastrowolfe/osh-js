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
    services: ["http://sensiasoft.net:8181/"]
});

//------ More complex example
 var discoveryView = new OSH.UI.DiscoveryView("",{
        services: ["http://sensiasoft.net:8181/"] // server list
    });
 */
OSH.UI.DiscoveryView = OSH.UI.View.extend({

    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId,[],properties);

        this.dialogContainer = document.body.id;

        this.formTagId = "form-"+OSH.Utils.randomUUID();
        this.serviceSelectTagId = "service-"+OSH.Utils.randomUUID();
        this.offeringSelectTagId = "offering-"+OSH.Utils.randomUUID();
        this.observablePropertyTagId = "obsProperty-"+OSH.Utils.randomUUID();
        this.nameTagId = "name-"+OSH.Utils.randomUUID();
        this.startTimeTagId = "startTime-"+OSH.Utils.randomUUID();
        this.endTimeTagId = "endTime-"+OSH.Utils.randomUUID();
        this.typeSelectTagId = "type-"+OSH.Utils.randomUUID();
        this.formButtonId = "submit-"+OSH.Utils.randomUUID();
        this.syncMasterTimeId = "syncMasterTime-"+OSH.Utils.randomUUID();
        this.replaySpeedId = "resplaySpeed-"+OSH.Utils.randomUUID();
        this.responseFormatId = "responseFormat-"+OSH.Utils.randomUUID();
        this.bufferingId = "buffering-"+OSH.Utils.randomUUID();
        this.timeShiftId = "timeShift-"+OSH.Utils.randomUUID();
        this.timeoutId = "timeout-"+OSH.Utils.randomUUID();

        // add template
        var discoveryForm = document.createElement("form");
        discoveryForm.setAttribute("action","#");
        discoveryForm.setAttribute("id",this.formTagId);
        discoveryForm.setAttribute("class",'discovery-form');

        document.getElementById(this.divId).appendChild(discoveryForm);

        var strVar="";
        strVar += "<ul class=\"osh-ul\">";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <h2>Discovery<\/h2>";
        strVar += "                <span class=\"required_notification\">* Denotes Required Field<\/span>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <label>Service:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                     <select id=\""+this.serviceSelectTagId+"\" required pattern=\"^(?!Select a service$).*\">";
        strVar += "                         <option value=\"\" disabled selected>Select a service<\/option>";
        strVar += "                     <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <label>Offering:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                    <select id=\""+this.offeringSelectTagId+"\" required>";
        strVar += "                        <option value=\"\" disabled selected>Select an offering<\/option>";
        strVar += "                    <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <label>Observable Property:<\/label>";
        strVar += "                <div class=\"select-style\">";
        strVar += "                     <select id=\""+this.observablePropertyTagId+"\" required>";
        strVar += "                         <option value=\"\" disabled selected>Select a property<\/option>";
        strVar += "                     <\/select>";
        strVar += "                <\/div>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                 <label for=\"name\">Name:<\/label>";
        strVar += "                 <input id=\""+this.nameTagId+"\"  class=\"input-text\" type=\"input-text\" name=\"name\"/>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <label for=\"startTime\">Start time:<\/label>";
        //strVar += "                <input type=\"text\" name=\"startTime\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\" required pattern=\"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)\" />";
        strVar += "                <input id=\""+this.startTimeTagId+"\" type=\"text\" name=\"startTime\" class=\"input-text\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\" required/>";
        strVar += "                <span class=\"form_hint\">YYYY-MM-DDTHH:mm:ssZ<\/span>";
        strVar += "            <\/li>";
        strVar += "            <li class=\"osh-li\">";
        strVar += "                <label for=\"endTime\">End time:<\/label>";
        //strVar += "                <input type=\"text\" name=\"endTime\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\"  required pattern=\"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)\" />";
        strVar += "                <input id=\""+this.endTimeTagId+"\" type=\"text\" name=\"endTime\" class=\"input-text\" placeholder=\"YYYY-MM-DDTHH:mm:ssZ\"  required/>";
        strVar += "                <span class=\"form_hint\">YYYY-MM-DDTHH:mm:ssZ<\/span>";
        strVar += "            <\/li>";
        strVar += "            <div class=\"advanced\">";
        strVar += "                 <!--input type=\"checkbox\" class=\"advanced\"><i class=\"fa fa-plus-square-o details-button\" aria-hidden=\"true\"><\/i>&nbsp; Advanced <\/input-->";
        strVar += "                 <input type=\"checkbox\" name=\"advanced\" id=\"advanced\"/><label for=\"advanced\"><i class=\"fa\"></i>Advanced</label>";
        strVar += "                 <div class=\"details\">";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"syncMasterTime\">Sync master time:<\/label>";
        strVar += "                         <input id=\""+this.syncMasterTimeId+"\"  class=\"input-checkbox\" type=\"checkbox\" name=\"syncMasterTime\" />";
        strVar += "                     <\/li>";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"replaySpeed\">Replay factor:<\/label>";
        strVar += "                         <input id=\""+this.replaySpeedId+"\"  class=\"input-text\" type=\"input-text\" name=\"replaySpeed\" value=\'1\' />";
        strVar += "                     <\/li>";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"responseFormat\">Response format<\/label>";
        strVar += "                         <input id=\""+this.responseFormatId+"\"  class=\"input-text\" type=\"input-text\" name=\"responseFormat\" placeholder='\e.g: mp4\'/>";
        strVar += "                     <\/li>";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"buffering\">Buffering time (ms)<\/label>";
        strVar += "                         <input id=\""+this.bufferingId+"\"  class=\"input-text\" type=\"input-text\" name=\"buffering\" value=\'1000\'/>";
        strVar += "                     <\/li>";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"timeShift\">TimeShift (ms)<\/label>";
        strVar += "                         <input id=\""+this.timeShiftId+"\"  class=\"input-text\" type=\"input-text\" name=\"timeShift\" value=\"0\"/>";
        strVar += "                     <\/li>";
        strVar += "                     <li class=\"osh-li\">";
        strVar += "                         <label for=\"timeout\">Timeout (ms)<\/label>";
        strVar += "                         <input id=\""+this.timeoutId+"\"  class=\"input-text\" type=\"input-text\" name=\"timeout\" value=\"1000\"/>";
        strVar += "                     <\/li>";
        strVar += "                 <\/div>";
        strVar += "             <\/div>";
        strVar += "            <li class=\"osh-li\">";
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
        OSH.EventManager.observeDiv(this.observablePropertyTagId,"change",this.onSelectedObsProperty.bind(this));
        OSH.EventManager.observeDiv(this.formTagId,"submit",this.onFormSubmit.bind(this));

        // definition mapping

        this.definitionMap = {
            "http://www.opengis.net/def/property/OGC/0/SensorLocation" : "json", //location
            "http://sensorml.com/ont/swe/property/Location" : "json", //location
            "http://sensorml.com/ont/swe/property/Latitude" : "json", //location
            "http://sensorml.com/ont/swe/property/Longitude" : "json", //location
            "http://sensorml.com/ont/swe/property/Altitude" : "json", //location
            "http://sensorml.com/ont/swe/property/OrientationQuaternion" : "json", //orientation
            "http://www.opengis.net/def/property/OGC/0/PlatformOrientation": "json", //orientation
            "http://sensorml.com/ont/swe/property/OSH/0/GimbalOrientation" : "json", // orientation
            "http://www.opengis.net/def/property/OGC/0/PlatformLocation" : "json", //location
            "http://sensorml.com/ont/swe/property/Weather" : "json", //curve
            "http://sensorml.com/ont/swe/property/WindSpeed" : "json", //curve
            "http://sensorml.com/ont/swe/property/WindDirection" : "json",
            "http://sensorml.com/ont/swe/property/VideoFrame": "video", //video
            "http://sensorml.com/ont/swe/property/Image" : "video"
        };
    },

    initDataSource:function(dataSource) {
        var serverTag = document.getElementById(this.serviceSelectTagId);

        serverTag.dataSourceId = dataSource.id;

        this.removeAllFromSelect(this.offeringSelectTagId);
        this.removeAllFromSelect(this.observablePropertyTagId);

        var dataSourceEndPoint = dataSource.properties.endpointUrl;
        if(!dataSourceEndPoint.startsWith("http")) {
            dataSourceEndPoint = "http://"+dataSourceEndPoint;
        }
        for(var i=0; i < serverTag.options.length;i++) {
            var currentOption = serverTag.options[i].value;
            if(!currentOption.startsWith("http")) {
                currentOption = "http://"+currentOption;
            }
            if(currentOption === dataSourceEndPoint) {
                serverTag.options[i].setAttribute("selected","");
                this.onSelectedService({dataSource:dataSource});
                break;
            }
        }

        // edit advanced values
        // sync master time
        var syncMasterTimeTag = document.getElementById(this.syncMasterTimeId);
        syncMasterTimeTag.checked = dataSource.syncMasterTime;

        // replaySpeed
        var replaySpeedTag = document.getElementById(this.replaySpeedId);
        replaySpeedTag.value = dataSource.properties.replaySpeed;

        // buffering
        var bufferingTag = document.getElementById(this.bufferingId);
        bufferingTag.value = dataSource.bufferingTime;

        // response format
        var responseFormatTag = document.getElementById(this.responseFormatId);
        responseFormatTag.value = (!isUndefined(dataSource.properties.responseFormat)) ? dataSource.properties.responseFormat : "";

        // time shift
        var timeShiftTag = document.getElementById(this.timeShiftId);
        timeShiftTag.value = dataSource.timeShift;

    },

    setButton:function(name) {
        var button = document.getElementById(this.formButtonId);
        button.innerHTML = name;
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

            var offeringMap = {};

            // load content
            for(var i=0;i < jsonObj.Capabilities.contents.offering.length;i++) {
                offering = jsonObj.Capabilities.contents.offering[i];
                this.addValueToSelect(this.offeringSelectTagId,offering.name,offering);

                offeringMap[offering.name] = offering;
            }

            // edit selected filter
            if(!isUndefined(event.dataSource)) {
                var offeringTag = document.getElementById(this.offeringSelectTagId);
                var offeringId = event.dataSource.properties.offeringID;

                for(var i=0; i < offeringTag.options.length;i++) {
                    var currentOption = offeringTag.options[i].value;
                    var currentOffering = offeringMap[offeringTag.options[i].value];

                    if(!isUndefined(currentOffering) && currentOffering.identifier === offeringId) {
                        offeringTag.options[i].setAttribute("selected","");
                        this.onSelectedOffering({dataSource:event.dataSource});
                        break;
                    }
                }

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

        // feed observable properties
        for(var i = 0; i  < offering.observableProperty.length;i++) {
            // check if obs if supported
            var disable = false;
            disable = !(offering.observableProperty[i] in this.definitionMap);
            this.addValueToSelect(this.observablePropertyTagId,offering.observableProperty[i],offering,null,disable);
        }

        // edit selected filter
        if(!isUndefined(event.dataSource)) {
            var obsPropertyTag = document.getElementById(this.observablePropertyTagId);

            for(var i=0; i < obsPropertyTag.options.length;i++) {
                var currentOption = obsPropertyTag.options[i].value;

                if(currentOption === event.dataSource.properties.observedProperty) {
                    obsPropertyTag.options[i].setAttribute("selected","");
                    this.onSelectedObsProperty({dataSource:event.dataSource});
                    break;
                }
            }

            // setup start/end time
            startTimeInputTag.value = event.dataSource.properties.startTime;
            endTimeInputTag.value = event.dataSource.properties.endTime;
        } else {
            // set times
            startTimeInputTag.value = offering.phenomenonTime.beginPosition;

            if(typeof offering.phenomenonTime.endPosition.indeterminatePosition !== "undefined") {
                var d = new Date();
                d.setUTCFullYear(2055);
                endTimeInputTag.value = d.toISOString();
            } else {
                endTimeInputTag.value = offering.phenomenonTime.endPosition;
            }
        }
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    onSelectedObsProperty: function(event) {
        // edit filter
        if(!isUndefined(event.dataSource)) {
            // setup name
            document.getElementById(this.nameTagId).value = event.dataSource.name;

        } else {
            var e = document.getElementById(this.observablePropertyTagId);
            var option = e.options[e.selectedIndex];
            var obsProp = option.value;

            var split = obsProp.split("/");

            var newNameValue = "";

            if(typeof  split !== "undefined" && split !== null && split.length > 0) {
                newNameValue = split[split.length-1];
            }

            document.getElementById(this.nameTagId).value = newNameValue;
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

        // name
        var nameTag = document.getElementById(this.nameTagId);

        // time
        var startTimeInputTag = document.getElementById(this.startTimeTagId);
        var endTimeInputTag = document.getElementById(this.endTimeTagId);

        // sync master time
        var syncMasterTimeTag = document.getElementById(this.syncMasterTimeId);

        // replaySpeed
        var replaySpeedTag = document.getElementById(this.replaySpeedId);

        // buffering
        var bufferingTag = document.getElementById(this.bufferingId);

        // response format
        var responseFormatTag = document.getElementById(this.responseFormatId);

        // time shift
        var timeShiftTag = document.getElementById(this.timeShiftId);

        // timeout
        var timeoutTag = document.getElementById(this.timeoutId);

        // get values
        var name=offeringTagSelectedOption.parent.name;
        var endPointUrl=serviceTagSelectedOption.value;
        var offeringID=offeringTagSelectedOption.parent.identifier;
        var obsProp=observablePropertyTagSelectedOption.value;
        var startTime=startTimeInputTag.value;
        var endTime=endTimeInputTag.value;

        endPointUrl = endPointUrl.replace('http://', '');
        var syncMasterTime = syncMasterTimeTag.checked;

        var replaySpeed = replaySpeedTag.value;
        var buffering = bufferingTag.value;
        var responseFormat = responseFormatTag.value;
        var timeShift = timeShiftTag.value;
        var timeout = timeoutTag.value;

        var properties = {
            name:nameTag.value,
            protocol: "ws",
            service: "SOS",
            endpointUrl: endPointUrl,
            offeringID: offeringID,
            observedProperty: obsProp,
            startTime: startTime,
            endTime: endTime,
            replaySpeed: Number(replaySpeed),
            syncMasterTime: syncMasterTime,
            bufferingTime: Number(buffering),
            timeShift: Number(timeShift),
            timeout: Number(timeout),
            responseFormat: (typeof responseFormat !== "undefined" && responseFormat !== null) ? responseFormat : undefined
        };

        var existingDSId = serviceTag.dataSourceId;
        var dsType = OSH.DataReceiver.DataSourceFactory.definitionMap[obsProp];

        OSH.DataReceiver.DataSourceFactory.createDatasourceFromType(dsType, properties,function(result){
            if(!isUndefined(existingDSId)) {
                result.id = existingDSId;
                this.onEditHandler(result);
            } else {
                this.onAddHandler(result);
            }
        }.bind(this));

        return false;
    },

    onEditHandler:function(datasource) {},
    onAddHandler:function(datasource) {},

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
     * @param disable indicate if the the option will be disabled
     * @memberof OSH.UI.DiscoveryView
     * @instance
     */
    addValueToSelect:function(tagId,value,parent,object,disable) {
        var selectTag = document.getElementById(tagId);
        var option = document.createElement("option");
        option.text = value;
        option.value = value;
        option.parent = parent;

        if(typeof object !== "undefined" && object !== null) {
            option.object = object;
        }

        if(typeof parent !== "undefined") {
            option.parent = parent;
        }
        if(typeof disable !== "undefined" && disable) {
            option.setAttribute("disabled","");
            option.text += " (not supported)";
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

    getType: function()  {
        return OSH.UI.View.ViewType.DISCOVERY;
    }
});
