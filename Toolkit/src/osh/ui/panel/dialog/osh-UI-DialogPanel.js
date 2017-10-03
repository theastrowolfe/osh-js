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
 * @class
 * @type {OSH.UI.Panel}
 * @augments OSH.UI.Panel
 * @example
 var dialogPanel =  new OSH.UI.DialogPanel(containerDivId, {
        draggable: false,
        css: "dialog",
        name: title,
        show:false,
        pinContainerId: "pin-container",
        closeable: true,
        connectionIds : dataSources ,
        swapId: "main-container",
        destroyOnClose: true,
        modal: false
    });
 */
OSH.UI.Panel.DialogPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId,options);
        // creates HTML eflement
        this.dialogId = "dialog-" + OSH.Utils.randomUUID();
        this.pinDivId = "dialog-pin-" + OSH.Utils.randomUUID();
        var closeDivId = "dialog-close-" + OSH.Utils.randomUUID();
        this.connectDivId = "dialog-connect-" + OSH.Utils.randomUUID();
        this.minimizeId = "dialog-min-"+OSH.Utils.randomUUID();
        this.titleId = "dialog-title-"+OSH.Utils.randomUUID();
        // mapping to allow dialog receiving view EVENT
        this.id = this.dialogId;

        this.name = "Untitled";

        var headerVar = "";
        headerVar += "<div class=\"header\">";

        this.pinContainerId = null;
        this.closeable = false;
        this.connected = false;
        this.swapped = false;
        this.connectionIds = [];
        this.draggable = false;
        this.destroyOnClose = false;
        this.modal = false;


        // build HEADER
        if(!isUndefined(options) && !isUndefined(options.name)) {
            this.name = options.name;
        }

        headerVar += "<span class=\" line-left\" id=\"" + this.titleId + "\">" + this.name + "<\/span>";
        headerVar += "   <table class=\"line-right\">";
        headerVar += "      <tr>";

        if(!isUndefined(options)){
            if(!isUndefined (options.swapId) && options.swapId !== "") {
                this.swapDivId = "dialog-exchange-" + OSH.Utils.randomUUID();
                headerVar += "<td><i id=\"" + this.swapDivId + "\" class=\"fa fa-fw pop-icon pop-icon-swap\" aria-hidden=\"true\"><\/i><\/td>";
                this.divIdToSwap  = options.swapId;
            }

            if(!isUndefined(options.connectionIds) && !isUndefined(options.connectionIds) && options.connectionIds.length > 0) {
                // add connected icon to disconnect/connect datasource
                headerVar += "<td><i id=\"" + this.connectDivId + "\" class=\"fa  fa-fw pop-icon pop-icon-connect\" aria-hidden=\"true\"><\/i><\/td>";
                this.connected = true;
                this.connectionIds = options.connectionIds;
            }

            if( !isUndefined(options.pinContainerId) && options.pinContainerId !== "") {
                headerVar += "<td><i id=\"" + this.pinDivId + "\" class=\"fa fa-fw pop-icon pop-icon-unpin\" aria-hidden=\"true\"><\/i><\/td>";
                this.pinContainerId = options.pinContainerId;
            }

             headerVar += "<td><i id=\"" + this.minimizeId + "\" class=\"fa fa-fw pop-icon pop-icon-min\" aria-hidden=\"true\"><\/i><\/td>";

            if(!isUndefined(options.closeable) && options.closeable) {
                headerVar += "<td><i id=\"" + closeDivId + "\" class=\"fa fa-fw pop-icon pop-icon-close\" aria-hidden=\"true\"><\/i><\/td>";
                this.closeable = options.closeable;
            }

            if(!isUndefined(options.draggable) && options.draggable) {
                this.draggable = options.draggable;
            }

            if(!isUndefined(options.destroyOnClose)) {
                this.destroyOnClose = options.destroyOnClose;
            }

            if(!isUndefined(options.modal)) {
                this.modal = options.modal;
            }
        }

        if(this.modal) {
            this.closeable = true;
        }

        headerVar += "      <\/tr>";
        headerVar += "   <\/table>";
        headerVar += "<\/div>";
        headerVar += "<div style=\"clear: both;\"><\/div>";

        if(parentElementDivId === "") {
            this.parentElementDivId = document.body;
        } else {
            this.parentElementDivId = parentElementDivId;
        }

        this.rootTag = document.getElementById(this.divId);
        this.rootTag.innerHTML = headerVar;

        this.rootTag.setAttribute("class", "pop-over resizable");
        this.rootTag.setAttribute("draggable", this.draggable);


        // set root parent
        var p = this.rootTag.parentNode;

        this.outer = document.createElement("div");
        this.outer.setAttribute("class",(this.modal) ? "osh dialog modal " : "osh dialog ");
        this.outer.appendChild(this.rootTag);

        p.appendChild(this.outer);

        this.keepRatio = false;
        var css = this.rootTag.className;

        var keepRatioCss = "";

        if(!isUndefined(options)) {

            if (options.css) {
                css += " " + options.css;
            }
            if(!isUndefined(options.keepRatio) && options.keepRatio) {
                this.keepRatio = true;
                keepRatioCss = " keep-ratio-w";
            }
        }
        css += keepRatioCss;
        this.rootTag.setAttribute("class", css);

        // content
        this.flexDiv = document.createElement("div");
        this.flexDiv.setAttribute("class","pop-inner");

        this.popContentDiv = document.createElement("div");
        this.popContentDiv.setAttribute("class","pop-content");
        this.popContentDiv.setAttribute("id","pop-content-id-"+OSH.Utils.randomUUID());

        if(!this.keepRatio) {
            OSH.Utils.addCss(this.popContentDiv,"no-keep-ratio");
        }

        this.flexDiv.appendChild(this.popContentDiv);
        // plugs it into the new draggable dialog
        this.rootTag.appendChild(this.flexDiv);

        // footer
        this.footer = document.createElement("div");
        this.footer.setAttribute("class","footer");

        this.footerContent = document.createElement("div");
        this.footerContent.setAttribute("id","footer-id-"+OSH.Utils.randomUUID());

        this.footer.appendChild(this.footerContent);
        this.rootTag.appendChild(this.footer);

        if(!isUndefined(options)) {
            if(!isUndefined(options.show) && !options.show) {
                OSH.Utils.addCss(this.outer,"hide");

                // because the inherited class owns a show property as well, we have to remove that one
                this.rootTag.style.display = "block";
            } else {
                this.initialWidth = this.rootTag.offsetWidth;
            }
        }

        // adds listener
        this.rootTag.addEventListener('dragstart', this.drag_start.bind(this), false);
        document.addEventListener('dragover', this.drag_over.bind(this), false);
        document.addEventListener('drop', this.drop.bind(this), false);

        if(this.closeable) {
            document.getElementById(closeDivId).onclick = this.close.bind(this);
        }

        if(this.pinContainerId !== null) {
            document.getElementById(this.pinDivId).onclick = this.pin.bind(this);
        }

        if(this.connectionIds.length > 0) {
            document.getElementById(this.connectDivId).onclick = this.connect.bind(this);
        }

        if(!isUndefined(this.swapDivId)) {
            document.getElementById(this.swapDivId).onclick = this.swapClick.bind(this);
        }

        document.getElementById(this.minimizeId).onclick = this.minimize.bind(this);

        var self = this;

        // observe events to update the dialog after disconnect/connect events handling
        OSH.EventManager.observe(OSH.EventManager.EVENT.CONNECT_DATASOURCE,function(event) {
            var dataSources = event.dataSourcesId;
            if(dataSources.length === self.connectionIds.length) {
                if(dataSources.filter(function(n) {
                        return self.connectionIds.indexOf(n) !== -1;
                    }).length === self.connectionIds.length) {
                    var eltDiv = document.getElementById(self.connectDivId);
                    OSH.Utils.addCss(eltDiv,"pop-icon-connect");
                    OSH.Utils.removeCss(eltDiv,"pop-icon-disconnect");
                    self.connected = true;
                }
            }
        });

        OSH.EventManager.observe(OSH.EventManager.EVENT.DISCONNECT_DATASOURCE,function(event) {
            var dataSources = event.dataSourcesId;
            if(dataSources.length === self.connectionIds.length) {
                if(dataSources.filter(function(n) {
                        return self.connectionIds.indexOf(n) !== -1;
                    }).length === self.connectionIds.length) {
                    var eltDiv = document.getElementById(self.connectDivId);
                    OSH.Utils.removeCss(eltDiv,"pop-icon-connect");
                    OSH.Utils.addCss(eltDiv,"pop-icon-disconnect");
                    self.connected = false;
                }
            }
        });

        OSH.EventManager.observe("swap-restore",function(event) {
            if(self.swapped && event.exclude !== self.id) {
                self.swap();
                self.swapped = false;
            }
        });

        // observes the SHOW event
        OSH.EventManager.observe(OSH.EventManager.EVENT.SHOW_VIEW,function(event){
            this.show(event);
        }.bind(this));

    },

    /**
     * Swap the current div with the div given as parameter
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    swapClick: function() {
        OSH.EventManager.fire("swap-restore",{exclude: this.id});
        this.swap();
    },

    /**
     * Minify or restore the window
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    minimize:function() {
        if(this.flexDiv.className.indexOf("hide") > -1) {
            OSH.Utils.removeCss(this.flexDiv,"hide");
            OSH.Utils.removeCss(document.getElementById(this.minimizeId),"pop-icon-max");
            OSH.Utils.addCss(this.rootTag,"resizable");
            OSH.Utils.removeCss(this.rootTag,"minimized");

            OSH.Utils.addCss(document.getElementById(this.minimizeId),"pop-icon-min");
        } else {
            this.flexDiv.setAttribute("class", this.flexDiv.className + " hide");
            OSH.Utils.removeCss(document.getElementById(this.minimizeId),"pop-icon-min");
            OSH.Utils.addCss(this.rootTag,"minimized");
            OSH.Utils.removeCss(this.rootTag,"resizable");

            OSH.Utils.addCss(document.getElementById(this.minimizeId),"pop-icon-max");
        }
    },

    /**
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    swap:function() {
        // swap the child of the popContentDiv with the child contained in the the containerDiv
        var containerDivToSwap = document.getElementById(this.divIdToSwap);
        if(!isUndefinedOrNull(containerDivToSwap)) {
            if(!this.swapped) {
                // get
                var popContent = this.popContentDiv.firstChild;
                this.contentViewId = popContent.id;
                var swapContainerContent = containerDivToSwap.firstChild;

                // remove
                containerDivToSwap.removeChild(swapContainerContent);
                this.popContentDiv.removeChild(popContent);

                // append
                containerDivToSwap.appendChild(popContent);
                this.popContentDiv.appendChild(swapContainerContent);
                this.swapped = true;

                // update title
                document.getElementById(this.titleId).innerText = "- Swapped -";

                // if keep ratio
                if(this.keepRatio) {
                    // remove css class from dialog
                    OSH.Utils.removeCss(this.rootTag,"keep-ratio-w");
                    // does not keep ratio for the new content
                    OSH.Utils.addCss(this.popContentDiv,"no-keep-ratio");
                    OSH.Utils.addCss(containerDivToSwap,"keep-ratio-h");
                }
            } else {
                // get
                var popContent = this.popContentDiv.firstChild;
                var swapContainerContent = document.getElementById(this.contentViewId);

                // remove
                containerDivToSwap.removeChild(swapContainerContent);
                this.popContentDiv.removeChild(popContent);

                // append
                containerDivToSwap.appendChild(popContent);
                this.popContentDiv.appendChild(swapContainerContent);

                // update title
                document.getElementById(this.titleId).innerText = this.name;
                this.swapped = false;

                // if keep ratio
                if(this.keepRatio) {
                    // remove css class from dialog
                    OSH.Utils.addCss(this.rootTag,"keep-ratio-w");
                    OSH.Utils.removeCss(this.popContentDiv,"no-keep-ratio");
                    OSH.Utils.removeCss(containerDivToSwap,"keep-ratio-h");
                }
            }

            // send resize event to the view
            var everyChild = document.getElementById(this.divIdToSwap).querySelectorAll("div");
            for (var i = 0; i<everyChild.length; i++) {
                var id = everyChild[i].id;
                if(id.startsWith("view-")) {
                    OSH.EventManager.fire(OSH.EventManager.EVENT.RESIZE+"-"+id);
                }
            }

            everyChild = this.popContentDiv.querySelectorAll("div");
            for (var i = 0; i < everyChild.length; i++) {
                var id = everyChild[i].id;
                if(id.startsWith("view-")) {
                    OSH.EventManager.fire(OSH.EventManager.EVENT.RESIZE+"-"+id);
                }
            }
        }
    },

    /**
     *
     * @param properties
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    show: function(properties) {
        if(!isUndefinedOrNull(this.contentId) && properties.viewId.indexOf(this.contentId) > -1) {
            OSH.Utils.removeCss(this.outer,"hide");
            if(!isUndefined(this.initialWidth)) {
                this.initialWidth = this.rootTag.offsetWidth;
            }
        }
    },

    /**
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    connect: function() {
        if(!this.swapped) {
            if (!this.connected) {
                OSH.EventManager.fire(OSH.EventManager.EVENT.CONNECT_DATASOURCE, {dataSourcesId: this.connectionIds});
            } else {
                OSH.EventManager.fire(OSH.EventManager.EVENT.DISCONNECT_DATASOURCE, {dataSourcesId: this.connectionIds});
            }
        }
    },

    /**
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    pin: function() {
        var pinElt = document.getElementById(this.pinDivId);
        var containerElt = document.getElementById(this.parentElementDivId);

        if (pinElt.className.indexOf("pop-icon-unpin") <= -1 ) {
            var bodyRect = document.body.getBoundingClientRect(),
                elemRect = this.rootTag.getBoundingClientRect(),
                offsetTop = elemRect.top - bodyRect.top,
                offsetLeft = elemRect.left - bodyRect.left;

            this.rootTag.setAttribute("draggable", true);
            //this.rootTag.parentNode.removeChild(this.rootTag);
            document.getElementById(this.pinContainerId).removeChild(this.rootTag.parentNode);
            containerElt.appendChild(this.rootTag.parentNode);
            this.rootTag.style.top = offsetTop;
            this.rootTag.style.left = offsetLeft;
            this.rootTag.style.position = "absolute";
            this.draggable = true;

            OSH.Utils.removeCss(pinElt,"pop-icon-pin");
            OSH.Utils.addCss(pinElt,"pop-icon-unpin");
        } else {
            this.rootTag.style.top = 0;
            this.rootTag.style.left = 0 - (this.rootTag.offsetWidth - this.initialWidth);
            this.rootTag.style.position = "relative";
            this.rootTag.setAttribute("draggable", false);

            containerElt.removeChild(this.rootTag.parentNode);

            document.getElementById(this.pinContainerId).appendChild(this.rootTag.parentNode);
            this.draggable = false;

            OSH.Utils.removeCss(pinElt,"pop-icon-unpin");
            OSH.Utils.addCss(pinElt,"pop-icon-pin");
        }
    },


    /**
     *
     * @param callback
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    onClose: function () {
    },

    /**
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    close: function () {
        if(this.destroyOnClose) {
            this.outer.parentNode.removeChild(this.outer);
        } else {
            this.outer.setAttribute("class", this.outer.className +  " closed");
        }
        this.onClose();
    },

    /**
     *
     * @param event
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    drag_start: function (event) {
        event.stopPropagation();
        // Grab all computed styles of the dragged object
        if(event.target instanceof  Element) {
            var style = window.getComputedStyle(event.target, null);
            // dataTransfer sets data that is being dragged. In this case, the current X and Y values (ex. "1257,104")
            event.dataTransfer.effectAllowed = 'all';
            event.dataTransfer.setData("text-" + this.rootTag.id,
                (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
        }
    },

    /**
     *
     * @param event
     * @returns {boolean}
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    drag_over: function (event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    },

    /**
     *
     * @param event
     * @returns {boolean}
     * @instance
     * @memberof OSH.UI.DialogPanel
     */
    drop: function (event) {
        event.stopPropagation();
        // Set array of x and y values from the transfer data
        var offset = event.dataTransfer.getData("text-" + this.rootTag.id).split(',');
        this.rootTag.style.left = ((event.clientX + parseInt(offset[0], 10)) * 100) / window.innerWidth + "%";
        this.rootTag.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
        event.preventDefault();
        return false;
    }
});