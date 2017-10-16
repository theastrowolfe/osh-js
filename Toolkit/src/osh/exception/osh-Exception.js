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

OSH.Exception.Exception = function(msg,errorObj) {
    var error = Error.apply(this, arguments);
    error.name = this.name = 'OSH Exception';

    this.message = error.message;
    this.originalErrorObject = errorObj;
    this.stack = error.stack;

    return this;
};

OSH.Exception.Exception.prototype = Object.create(Error.prototype, {
    constructor: { value: OSH.Exception.Exception }
});


OSH.Exception.Exception.prototype.printStackTrace = function() {
    return this.stack;
};

OSH.Exception.Exception.prototype.getMessage = function() {
    return this.message;
};

OSH.Exception.Exception.prototype.getOriginalError = function() {
    return this.originalErrorObject;
};