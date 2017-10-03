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
 * @type {OSH.DataConnector.DataConnector}
 * @classdesc Defines the AjaxConnector to connect to a remote server by making AjaxRequest.
 * @class
 * @augments OSH.DataConnector.DataConnector
 * @example
 * var url = ...;
 * var connector = new OSH.DataConnector.WebSocketDataConnector(url);
 *
 * // connect
 * connector.connect();
 *
 * // disconnect
 * connector.disconnect();
 *
 * // close
 * connector.close();
 *
 */
OSH.DataConnector.WebSocketDataConnector = OSH.DataConnector.DataConnector.extend({
    /**
     * Connect to the webSocket. If the system supports WebWorker, it will automatically creates one otherwise use
     * the main thread.
     * @instance
     * @memberof OSH.DataConnector.WebSocketDataConnector
     */
    connect: function () {
        this.ENABLED = false; // disable webworker

        if (!this.init) {
            //creates Web Socket
            if (OSH.Utils.isWebWorker() && this.ENABLED) {
                var url = this.getUrl();
                var blobURL = URL.createObjectURL(new Blob(['(',

                        function () {
                            var ws = null;

                            self.onmessage = function (e) {
                                if (e.data === "close") {
                                    close();
                                } else {
                                    // is URL
                                    init(e.data);
                                }
                            }

                            function init(url) {
                                ws = new WebSocket(url);
                                ws.binaryType = 'arraybuffer';
                                ws.onmessage = function (event) {
                                    //callback data on message received
                                    if (event.data.byteLength > 0) {
                                        self.postMessage(event.data, [event.data]);
                                    }
                                }

                                ws.onerror = function (event) {
                                    ws.close();
                                    self.onerror(event);
                                };
                            }

                            function close() {
                                ws.close();
                            }
                        }.toString(), ')()'],
                    {type: 'application/javascript'}));

                this.worker = new Worker(blobURL);

                this.worker.postMessage(url);
                this.worker.onmessage = function (e) {
                    this.onMessage(e.data);
                }.bind(this);

                this.worker.onerror = function(error) {
                    this.onError(error);
                }.bind(this);
                // Won't be needing this anymore
                URL.revokeObjectURL(blobURL);
            } else {
                this.ws = new WebSocket(this.getUrl());
                this.ws.binaryType = 'arraybuffer';
                this.ws.onmessage = function (event) {
                    //callback data on message received
                    if (event.data.byteLength > 0) {
                        this.onMessage(event.data);
                    }
                }.bind(this);

                // closes socket if any errors occur
                this.ws.onerror = function (event) {
                    this.close();
                };

                this.ws.onclose = function(e) {
                    var reason = 'Unknown error';
                    switch(e.code) {
                        case 1000:
                            reason = 'Normal closure';
                            break;
                        case 1001:
                            reason = 'An endpoint is going away';
                            break;
                        case 1002:
                            reason = 'An endpoint is terminating the connection due to a protocol error.';
                            break;
                        case 1003:
                            reason = 'An endpoint is terminating the connection because it has received a type of data it cannot accept';
                            break;
                        case 1004:
                            reason = 'Reserved. The specific meaning might be defined in the future.';
                            break;
                        case 1005:
                            reason = 'No status code was actually present';
                            break;
                        case 1006:
                            reason = 'The connection was closed abnormally';
                            break;
                        case 1007:
                            reason = 'The endpoint is terminating the connection because a message was received that contained inconsistent data';
                            break;
                        case 1008:
                            reason = 'The endpoint is terminating the connection because it received a message that violates its policy';
                            break;
                        case 1009:
                            reason = 'The endpoint is terminating the connection because a data frame was received that is too large';
                            break;
                        case 1010:
                            reason = 'The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn\'t.';
                            break;
                        case 1011:
                            reason = 'The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
                            break;
                        case 1012:
                            reason = 'The server is terminating the connection because it is restarting';
                            break;
                        case 1013:
                            reason = 'The server is terminating the connection due to a temporary condition';
                            break;
                        case 1015:
                            reason = 'The connection was closed due to a failure to perform a TLS handshake';
                            break;
                    }
                    if(e.code !== 1000 && e.code !== 1005) {
                        throw new OSH.Exception.Exception("Datasource is now closed[" + reason + "]: " + this.getUrl(), event);
                    } else {
                        //TODO:send log
                        console.log("Datasource has been closed normally");
                    }
                }.bind(this);
            }
            this.init = true;
        }
    },

    /**
     * Disconnects the websocket.
     * @instance
     * @memberof OSH.DataConnector.WebSocketDataConnector
     */
    disconnect: function() {
        if (OSH.Utils.isWebWorker() && this.worker != null && this.ENABLED) {
            this.worker.postMessage("close");
            this.worker.terminate();
            this.init = false;
        } else if (this.ws !== null) {
            if(this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.init = false;
        }
    },

    /**
     * The onMessage method used by the websocket to callback the data
     * @param data the callback data
     * @instance
     * @memberof OSH.DataConnector.WebSocketDataConnector
     */
    onMessage: function (data) {
    },

    onError:function(error) {
        throw new OSH.Exception.Exception("Cannot connect to the datasource "+this.getUrl(), error);
    },

    /**
     * Closes the webSocket.
     * @instance
     * @memberof OSH.DataConnector.WebSocketDataConnector
     */
    close: function() {
        this.disconnect();
    }
});
