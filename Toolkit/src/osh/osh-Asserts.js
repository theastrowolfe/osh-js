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
 *
 * @constructor
 */
OSH.Asserts = function() {};

OSH.Asserts.checkIsDefineOrNotNull = function(object,errorMessageTemplate) {

    if(isUndefinedOrNull(object)) {
        throw new OSH.Exception.Exception(errorMessageTemplate);
    }
    return object;
};

OSH.Asserts.checkObjectPropertyPath = function(object,path,errorMessageTemplate) {
    if(!OSH.Utils.hasOwnNestedProperty(object,path)){
        throw new OSH.Exception.Exception(errorMessageTemplate);
    }
    return object;
};