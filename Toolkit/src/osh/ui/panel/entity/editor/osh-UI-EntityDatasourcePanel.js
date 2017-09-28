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

OSH.UI.Panel.EntityDatasourcePanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, properties) {
        this._super(parentElementDivId, properties);
    },

    initPanel:function() {
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

        this.divElt.appendChild(buttonElt);
        this.divElt.appendChild(divContainer);

        this.datasources = {};
        this.nbDatasources = 0;
    },

    onAddDataSourceButtonClickHandler: function(event) {
        // init discovery view
        var discoveryView = new OSH.UI.DiscoveryView("",{
            services: this.options.services
        });

        discoveryView.onAddHandler = this.addDataSource.bind(this);

        var discoveryDialog = new OSH.UI.Panel.DialogPanel("", {
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
    },

    addDataSource:function(dataSource) {

        this.nbDatasources++;
        this.datasources[dataSource.id] = dataSource;

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
            delete self.datasources[dataSource.id];
            self.nbDatasources--;
        });

        OSH.EventManager.observeDiv(editId,"click",function(event) {
            // init discovery view
            var discoveryView = new OSH.UI.DiscoveryView("",{
                services: self.options.services
            });

            discoveryView.onEditHandler = self.editDataSource.bind(self);

            var discoveryDialog = new OSH.UI.Panel.DialogPanel("", {
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
        });
    },

    editDataSource:function(dataSource) {
        this.datasources[dataSource.id] = dataSource;

        document.getElementById("ds-name-"+dataSource.id).innerHTML = dataSource.name;

        this.buildDSResultTemplate(this.datasources[dataSource.id]);
    },

    loadDataSourcesProperty:function(dsPropertyArray,callback) {
        this.reset();
        var self = this;

        var nbElements = dsPropertyArray.length;

        for(var key in dsPropertyArray) {
            // gets new instance
            var datasource = OSH.DataReceiver.DataSourceFactory.createDatasourceFromType(dsPropertyArray[key],function(result){
                self.addDataSource(result);
                if(--nbElements === 0) {
                    callback(Object.values(this.datasources));
                }
            }.bind(this));
        }
    },

    reset:function() {
        OSH.Helper.HtmlHelper.removeAllNodes(document.getElementById(this.divDSContainerId));
        this.datasources = {};
        this.nbDatasources = 0;
    }
});