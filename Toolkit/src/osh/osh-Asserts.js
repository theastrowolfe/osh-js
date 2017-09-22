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

OSH.Asserts.checkIsDefineOrNotNull = function(object) {

    if(isUndefinedOrNull(object)) {
        throw new OSH.Exception.Exception("the object is undefined or null");
    }
    return object;
};

OSH.Asserts.checkObjectPropertyPath = function(object,path,errorMessage) {

    if(!OSH.Utils.hasOwnNestedProperty(object,path)){
        var message = "The path "+path+" for the object does not exists";
        if(!isUndefinedOrNull(errorMessage)) {
            message = errorMessage;
        }

        throw new OSH.Exception.Exception(message);
    }
    return object;
};

OSH.Asserts.checkArrayIndex = function(array, index) {
    if(array.length === 0) {
        throw new OSH.Exception.Exception("The array length is 0");
    } else if(index > array.length -1 ) {
        throw new OSH.Exception.Exception("The given index of the array is out of range:"+index+" > "+(array.length -1));
    }
};