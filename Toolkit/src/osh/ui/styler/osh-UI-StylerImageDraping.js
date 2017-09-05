/***************************** BEGIN LICENSE BLOCK ***************************

 The contents of this file are subject to the Mozilla Public License, v. 2.0.
 If a copy of the MPL was not distributed with this file, You can obtain one
 at http://mozilla.org/MPL/2.0/.

 Software distributed under the License is distributed on an "AS IS" basis,
 WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 for the specific language governing rights and limitations under the License.

 Copyright (C) 2015-2017 Sensia Software LLC. All Rights Reserved.

 Author: Alex Robin <alex.robin@sensiasoft.com>

 ******************************* END LICENSE BLOCK ***************************/

/**
 * @classdesc
 * @class OSH.UI.Styler.ImageDraping
 * @type {OSH.UI.Styler}
 * @augments OSH.UI.Styler
 */
OSH.UI.Styler.ImageDraping = OSH.UI.Styler.extend({
	initialize : function(properties) {
		this._super(properties);
		this.properties = properties;
		this.platformLocation = null;
		this.platformOrientation = null;
		this.gimbalOrientation = null;
		this.cameraModel = null;
		this.imageSrc = null;
		this.snapshotFunc = null;
		
		this.options = {};
		
		if (!isUndefinedOrNull(properties.platformLocation)){
			this.platformLocation = properties.platformLocation;
		} 
		
		if (!isUndefinedOrNull(properties.platformOrientation)){
			this.platformOrientation = properties.platformOrientation;
		} 
		
		if (!isUndefinedOrNull(properties.gimbalOrientation)){
			this.gimbalOrientation = properties.gimbalOrientation;
		} 
		
		if (!isUndefinedOrNull(properties.cameraModel)){
			this.cameraModel = properties.cameraModel;
		}
		
		if (!isUndefinedOrNull(properties.imageSrc)){
			this.imageSrc = properties.imageSrc;
		} 
		
		if (!isUndefinedOrNull(properties.platformLocationFunc)) {
			var fn = function(rec,timeStamp,options) {
				this.platformLocation = properties.platformLocationFunc.handler(rec,timeStamp,options);
			}.bind(this);
            fn.fnName = "platformLocation";
			this.addFn(properties.platformLocationFunc.dataSourceIds,fn);
		}
		
		if (!isUndefinedOrNull(properties.platformOrientationFunc)) {
			var fn = function(rec,timeStamp,options) {
				this.platformOrientation = properties.platformOrientationFunc.handler(rec,timeStamp,options);
			}.bind(this);
            fn.fnName = "platformOrientation";
			this.addFn(properties.platformOrientationFunc.dataSourceIds,fn);
		}
		
		if (!isUndefinedOrNull(properties.gimbalOrientationFunc)) {
			var fn = function(rec,timeStamp,options) {
				this.gimbalOrientation = properties.gimbalOrientationFunc.handler(rec,timeStamp,options);
			}.bind(this);
            fn.fnName = "gimbalOrientation";
			this.addFn(properties.gimbalOrientationFunc.dataSourceIds,fn);
		}
		
		if (!isUndefinedOrNull(properties.cameraModelFunc)) {
			var fn = function(rec,timeStamp,options) {
				this.cameraModel = properties.cameraModelFunc.handler(rec,timeStamp,options);
			}.bind(this);
            fn.fnName = "cameraModel";
			this.addFn(properties.cameraModelFunc.dataSourceIds,fn);
		}
		
		if (!isUndefinedOrNull(properties.snapshotFunc)) {
            fn.fnName = "snapshot";
			this.snapshotFunc = properties.snapshotFunc;
		}
	},

	/**
	 *
	 * @param $super
	 * @param view
	 * @memberof  OSH.UI.Styler.ImageDraping
	 * @instance
	 */
	init: function(view) {
		this._super(view);
	},

	/**
	 *
	 * @param $super
	 * @param dataSourceId
	 * @param rec
	 * @param view
	 * @param options
	 * @memberof  OSH.UI.Styler.ImageDraping
	 * @instance
	 */
	setData: function(dataSourceId,rec,view,options) {
		if (this._super(dataSourceId,rec,view,options)) {
			
			var enabled = true;
			var snapshot = false;
			if (this.snapshotFunc != null)
			    snapshot = this.snapshotFunc();
			
			if (typeof(view) != "undefined" && enabled &&
				this.platformLocation != null &&
				this.platformOrientation != null &&
				this.gimbalOrientation != null &&
				this.cameraModel != null &&
				this.imageSrc != null) {
				    view.updateDrapedImage(this,rec.timeStamp,options,snapshot);
			}
		}
	}

});