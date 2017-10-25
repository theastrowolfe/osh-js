/**
 * @classdesc
 * @class
 * @type {OSH.UI.Panel}
 * @augments OSH.UI.Panel
 * @example
 var dialogPanel =  new OSH.UI.Panel.DialogPanel(containerDivId, {
        pinContainerId: "pin-container",
        swapContainerId: "main-container",
        title: title,
        show:false,
        css: "dialog",
        draggable: false,
        resizable: true,

        closeable: true,
        connectionIds : dataSources ,
        destroyOnClose: true,
        modal: false
    });
 */
OSH.UI.Panel.DialogPanel = OSH.UI.Panel.extend({
    initialize: function (parentElementDivId, options) {
        this._super(parentElementDivId, options);
    },

    initPanel: function () {
        OSH.Utils.addCss(this.elementDiv, "dialog");
        // creates header
        this.headerElt = this.createHeader();

        // creates content
        this.contentElt = this.createContent();

        // creates footer
        this.footerElt = this.createFooter();

        this.parentElementDiv = this.elementDiv.parentNode;

        // creates inner
        this.innerElementDiv = document.createElement("div");
        this.innerElementDiv.setAttribute("class","dialog-inner "+this.options.css);

        this.elementDiv.appendChild(this.innerElementDiv);

        this.innerElementDiv.appendChild(this.headerElt);
        this.innerElementDiv.appendChild(this.contentElt);
        this.innerElementDiv.appendChild(this.footerElt);

        this.initDragAndDrop(this.innerElementDiv);

        this.updateProperties(this.options);
    },

    /**
     * Check properties
     * @param properties the new properties
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    checkOptions:function(properties) {
        if(!isUndefinedOrNull(properties)) {
            // checks title
            if (!isUndefined(properties.title)) {
                this.title = properties.title;
            } else if(isUndefinedOrNull(this.title)) {
                this.title = "Untitled"; // default value
            }

            // checks show
            if (!isUndefined(properties.show)) {
                this.show = properties.show;
            } else if(isUndefinedOrNull(this.show)) {
                this.show = true; // default value
            }

            // checks draggable
            if (!isUndefined(properties.draggable)) {
                this.draggable = properties.draggable;
            } else if(isUndefinedOrNull(this.draggable)) {
                this.draggable = true; // default value
            }

            // checks resizable
            if (!isUndefined(properties.resizable)) {
                this.resizable = properties.resizable;
            } else if(isUndefinedOrNull(this.resizable)) {
                this.resizable = true; // default value
            }

            // checks closeable
            if (!isUndefined(properties.closeable)) {
                this.closeable = properties.closeable;
            } else if(isUndefinedOrNull(this.closeable)) {
                this.closeable = true; // default value
            }

            // checks connected & connectionIds
            if (!isUndefined(properties.connectionIds)) {
                this.connectionIds = properties.connectionIds;
                this.connected = true;
            } else if(isUndefinedOrNull(this.connectionIds)) {
                this.connected = false;  // default value
                this.connectionIds = []; // default value
            }

            // checks pin
            if (!isUndefined(properties.pinContainerId)) {
                this.pin = {
                    containerId: this.options.pinContainerId,
                    originalContainerId: this.parentElementDiv.id,
                    lastPosition: {
                        x: 0,
                        y: 0
                    }
                }
            } else if(isUndefinedOrNull(this.pin)) {
                this.pin = null; // default value
            }

            // checks swap
            if (!isUndefined(properties.swapContainerId)) {
                var dstElt = document.getElementById(properties.swapContainerId);
                if (!isUndefinedOrNull(dstElt)) {
                    var parentDstElt = dstElt.parentNode;
                    if (!isUndefinedOrNull(parentDstElt)) {
                        this.swap = {
                            swapContainerId: properties.swapContainerId,
                            position: window.getComputedStyle(dstElt).getPropertyValue('position')
                        }
                    }
                }
            } else if(isUndefinedOrNull(this.swap)) {
                this.swap = null; // default value
            }

            // checks destroy on close
            if (!isUndefined(properties.destroyOnClose)) {
                this.destroyOnClose = properties.destroyOnClose;
            } else if(isUndefinedOrNull(this.destroyOnClose)) {
                this.destroyOnClose = false; // default value
            }

            // checks modal
            if (!isUndefined(properties.modal)) {
                this.modal = properties.modal;
            } else if(isUndefinedOrNull(this.modal)) {
                this.modal = false; // default value
            }
        }

        this.minimized = false;
    },

    //------- HEADER ---------------//
    /**
     * Init handler
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    createHeader: function () {
        var dialogHeaderElt = document.createElement("div");
        dialogHeaderElt.setAttribute("class", "dialog-header");

        // creates line
        // // Left element
        this.headerSpanLeftElt = document.createElement("span");
        this.headerSpanLeftElt.setAttribute("class","line-left");

        // // Right element
        var tableRightElt = document.createElement("table");
        tableRightElt.setAttribute("class","line-right");
        var tbodyElt = document.createElement("tbody");
        this.headerTrElt = document.createElement("tr");

        this.headerTdElts = {};

        tbodyElt.appendChild(this.headerTrElt);
        tableRightElt.appendChild(tbodyElt);

        dialogHeaderElt.appendChild(this.headerSpanLeftElt);
        dialogHeaderElt.appendChild(tableRightElt);

        return dialogHeaderElt;
    },

    /**
     * Update the dialog properties using new properties
     * @param properties the new properties
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    updateProperties:function(properties) {
        this.checkOptions(properties);

        this.headerSpanLeftElt.innerHTML = this.title;

        if(!isUndefinedOrNull(this.swap) && isUndefinedOrNull(this.headerTrElt.swap)) {
            this.headerTrElt.swap = this.addSwapIcon(this.headerTrElt);
        }

        if(!this.modal && !isUndefinedOrNull(this.pin) && isUndefinedOrNull(this.headerTrElt.pin)) {
            this.headerTrElt.pin = this.addPinIcon(this.headerTrElt);
            this.pin.position = window.getComputedStyle(this.interact.target).getPropertyValue('position');
        }

        if(isUndefinedOrNull(this.headerTrElt.minimize)) {
            this.headerTrElt.minimize = this.addMinimizeIcon(this.headerTrElt);
        }

        if((!isUndefinedOrNull(this.closeable) && this.closeable) && isUndefinedOrNull(this.headerTrElt.closeable)) {
            this.headerTrElt.closeable = this.addCloseIcon(this.headerTrElt);
        }

        this.setModal(this.modal);
        this.setVisible(this.show);
        this.interact.draggable(this.draggable);
        this.interact.resizable(this.resizable);
    },

    /**
     * Add swap icon to the parent element
     * @param parentElt the parent element to add the icon
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    addSwapIcon:function(parentElt) {
        // adds swap icon
        var tdElt = document.createElement("td");

        var swapIconElt = document.createElement("i");
        swapIconElt.setAttribute("class","fa fa-fw dialog-header-icon icon-swap");

        tdElt.appendChild(swapIconElt);
        parentElt.appendChild(tdElt);

        // adds listener
        this.addListener(swapIconElt,"click",this.swapHandler.bind(this));

        return swapIconElt;
    },

    /**
     * Add pin icon to the parent element
     * @param parentElt the parent element to add the icon
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    addPinIcon:function(parentElt) {
        // adds pin icon
        var tdElt = document.createElement("td");

        var pinIconElt = document.createElement("i");
        pinIconElt.setAttribute("class","fa fa-fw dialog-header-icon icon-pin");

        tdElt.appendChild(pinIconElt);
        parentElt.appendChild(tdElt);


        // adds listener
        this.addListener(pinIconElt,"click",this.pinHandler.bind(this));

        return pinIconElt;
    },

    /**
     * Add minimize icon to the parent element
     * @param parentElt the parent element to add the icon
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    addMinimizeIcon:function(parentElt) {
        // adds minimize icon
        var tdElt = document.createElement("td");

        var minimizeIconElt = document.createElement("i");
        minimizeIconElt.setAttribute("class","fa fa-fw dialog-header-icon icon-minimize");

        tdElt.appendChild(minimizeIconElt);
        parentElt.appendChild(tdElt);

        // adds listener
        this.addListener(minimizeIconElt,"click",this.minimizeHandler.bind(this));

        return minimizeIconElt;
    },

    /**
     * Add close icon to the parent element
     * @param parentElt the parent element to add the icon
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    addCloseIcon:function(parentElt) {
        // adds minimize icon
        var tdElt = document.createElement("td");

        var closeIconElt = document.createElement("i");
        closeIconElt.setAttribute("class","fa fa-fw dialog-header-icon icon-close");

        tdElt.appendChild(closeIconElt);
        parentElt.appendChild(tdElt);

        // adds listener
        this.addListener(closeIconElt,"click",this.closeHandler.bind(this));

        return closeIconElt;
    },

    setModal:function(isModal) {
        if(isModal) {
            OSH.Utils.addCss(this.elementDiv,"modal-block");
        } else {
            // current dialog is modal, make it non-modal
            OSH.Utils.removeCss(this.elementDiv,"modal-block");
        }
    },

    //------- END HEADER ---------------//

    /**
     * Create the content
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    createContent: function () {
        var dialogContentElt = document.createElement("div");
        dialogContentElt.setAttribute("class", "dialog-content ");
        dialogContentElt.setAttribute("id", "dialog-content-id-"+OSH.Utils.randomUUID());

        return dialogContentElt;
    },

    /**
     * Create the footer
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    createFooter: function () {
        var dialogFooterElt = document.createElement("div");
        dialogFooterElt.setAttribute("class", "dialog-footer");

        return dialogFooterElt;
    },

    /**
     * Init drag and drop
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    initDragAndDrop: function (element) {
        this.interact = interact(element)
            .draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                restrict: {
                    restriction: "parent",
                    endOnly: false,
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                },
                // enable autoScroll
                autoScroll: true,

                // call this function on every dragmove event
                onmove: dragMoveListener,
                // call this function on every dragend event
                onend: function (event) {
                }
            })
            .resizable({
                preserveAspectRatio: true,
                edges: {left: true, right: true, bottom: true, top: true},
                margin: 10
            })
            .on('resizemove', function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                // update the element's style
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            });

        var self = this;

        function dragMoveListener(event) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }

        // this is used later in the resizing and gesture demos
        window.dragMoveListener = dragMoveListener;
    },

    //------------ HANDLERS -----------------//
    /**
     * Handler for the swap event
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    swapHandler:function() {
        // swap only content
        if(!isUndefinedOrNull(this.swap)) {
            this.swapWith(this.swap.swapContainerId)
        }
    },

    /**
     * Handler for the pin event
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    pinHandler:function() {
        if(this.pinned) {
            // unpin: dialog -> original container
            this.unpin();
        } else {
            // pin: dialog -> dest container
            this.pinTo(this.pin.containerId);
        }
    },

    /**
     * Handler for the minimize event
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    minimizeHandler:function() {
        if(!this.minimized) {
            this.minimize();
        } else {
            this.restore();
        }
    },

    /**
     * Handler for the close event
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    closeHandler:function() {
        this.close();
    },

    connectDataSourceHandler:function() {
        if (this.connected) {
            OSH.EventManager.fire(OSH.EventManager.EVENT.DISCONNECT_DATASOURCE, {dataSourcesId: this.connectionIds});
        } else {
            OSH.EventManager.fire(OSH.EventManager.EVENT.CONNECT_DATASOURCE, {dataSourcesId: this.connectionIds});
        }

        this.connected = !this.connected;
    },

    //---------- FUNCTIONS ----------------//
    /**
     * Swap the dialog with another div
     * @param dstContainerId the div to swap with
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    swapWith:function(dstContainerId) {
        // removes content from dst
        var dstContainerElt = document.getElementById(dstContainerId);
        OSH.Asserts.checkIsDefineOrNotNull(dstContainerElt);

        // removes content from dst container
        var childrenDst = [];
        var i;
        for(i=0;i < dstContainerElt.children.length;i++) {
            childrenDst.push(dstContainerElt.removeChild(dstContainerElt.children[i]));
        }

        // removes content from dialog
        var childrenDialog = [];
        for(i=0;i < this.contentElt.children.length;i++) {
            childrenDialog.push(this.contentElt.removeChild(this.contentElt.children[i]));
        }

        // swap
        for(i=0;i < childrenDialog.length;i++) {
            dstContainerElt.appendChild(childrenDialog[i]);
        }

        for(i=0;i < childrenDst.length;i++) {
            this.contentElt.appendChild(childrenDst[i]);
        }

        /*  // overrides any position because it has to be relative
         firstRemovedElt.style.position = "relative";

         // applies saved position
         secondRemovedElt.style.position = this.swap.position;*/
    },

    /**
     * Pin the dialog.
     * @param containerId the parent element container id to pin the dialog into
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    pinTo:function(containerId) {
        if(!this.modal) {
            OSH.Asserts.checkIsDefineOrNotNull(this.interact);
            OSH.Asserts.checkIsDefineOrNotNull(this.interact.target);

            this.parentElementDiv.removeChild(this.elementDiv);

            var dstContainerElt = document.getElementById(containerId);
            OSH.Asserts.checkIsDefineOrNotNull(dstContainerElt);

            dstContainerElt.appendChild(this.elementDiv); //TODO: needs to store index?

            this.interact.draggable(false);

            // store last position
            this.pin.lastPosition.x = (parseFloat(this.interact.target.getAttribute('data-x')) || 0);
            this.pin.lastPosition.y = (parseFloat(this.interact.target.getAttribute('data-y')) || 0);

            // set dst position
            this.setPosition(0, 0);
            this.interact.target.style.position = "relative";

            OSH.Utils.addCss(this.headerTrElt.pin, "icon-selected");
            this.pinned = true;
        }
    },

    /**
     * Unpin the dialog
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    unpin:function() {
        if(!this.modal) {
            OSH.Asserts.checkIsDefineOrNotNull(this.interact);
            OSH.Asserts.checkIsDefineOrNotNull(this.interact.target);

            this.elementDiv.parentNode.removeChild(this.elementDiv);

            var originalContainerElt = document.getElementById(this.pin.originalContainerId);
            OSH.Asserts.checkIsDefineOrNotNull(originalContainerElt);

            originalContainerElt.appendChild(this.elementDiv); //TODO: needs to store index?
            this.interact.draggable(this.draggable);

            // restore position before pinning
            this.setPosition(this.pin.lastPosition.x, this.pin.lastPosition.y);

            // restore style before pinning
            OSH.Asserts.checkIsDefineOrNotNull(this.pin.position);
            this.interact.target.style.position = this.pin.position;

            OSH.Utils.removeCss(this.headerTrElt.pin, "icon-selected");
            this.pinned = false;
        }
    },

    /**
     * Minimize the dialog
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    minimize:function() {
        OSH.Utils.addCss(this.innerElementDiv,"minimized");
        OSH.Utils.addCss(this.contentElt,"hide");
        OSH.Utils.addCss(this.footerElt,"hide");

        OSH.Utils.replaceCss(this.headerTrElt.minimize,"icon-minimize","icon-restore");
        this.minimized = true;
        this.interact.resizable(false);
    },

    /**
     * Restore the dialog after minimizing
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    restore:function() {
        OSH.Utils.removeCss(this.innerElementDiv,"minimized");
        OSH.Utils.removeCss(this.contentElt,"hide");
        OSH.Utils.removeCss(this.footerElt,"hide");

        OSH.Utils.replaceCss(this.headerTrElt.minimize,"icon-restore","icon-minimize");
        this.minimized = false;
        this.interact.resizable(this.draggable);
    },

    /**
     *
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    onClose: function () {},

    /**
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    close: function () {
        if(this.destroyOnClose) {
            this.elementDiv.parentNode.removeChild(this.elementDiv);
        } else {
            this.setVisible(false);
        }
        this.onClose();
    },

    /**
     * Set the dialog position to x,y pixel coordinates
     * @instance
     * @memberof OSH.UI.Panel.DialogPanel
     */
    setPosition:function(x,y) {
        this.interact.target.style.webkitTransform =
            this.interact.target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

        this.interact.target.setAttribute('data-x', x);
        this.interact.target.setAttribute('data-y', y);
    }
});