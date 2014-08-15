#target Illustrator	
/*
不要オブジェクトを削除.jsx
Copyright (c) 2014 Toshiyuki Takahashi
Released under the MIT license
http://opensource.org/licenses/mit-license.php
http://www.graphicartsunit.com/
*/
(function () {
	// Preference
	var settings = {
		flagPathItem : true,
		flagPointText : true,
		flagAreaText : false,
		flagPathText : false,
		flagHairline : false,
		notDelete : false,
		delLockObject : false,
		showAlert : true
	};

	// Constant
	const SCRIPT_TITLE = "不要オブジェクトを削除";
	const SCRIPT_VERSION = "0.7.2";
	const HAIRLINE_ACCURACY = 100;

	// UI Dialog
	function mainDialog() {
		this.init();
		return this;
	};
	mainDialog.prototype.init = function() {

		var unit = 20;
		var thisObj = this;

		thisObj.dlg = new Window("dialog", SCRIPT_TITLE + " - ver." + SCRIPT_VERSION);
		thisObj.dlg.margins = [unit*1.5, unit*1.5, unit*1.5, unit*1.5];

		thisObj.checkBox = {};

		thisObj.settingPanel = thisObj.dlg.add("panel", undefined, "削除の対象：");
		thisObj.settingPanel.alignment = "left";
		thisObj.settingPanel.margins = [unit, unit, unit, unit];
		thisObj.settingPanel.orientation = "column";

		thisObj.checkBox.flagPathItem = thisObj.settingPanel.add("checkbox", undefined, "孤立点");
		thisObj.checkBox.flagPointText = thisObj.settingPanel.add("checkbox", undefined, "文字のないポイント文字");
		thisObj.checkBox.flagAreaText = thisObj.settingPanel.add("checkbox", undefined, "文字のないエリア内文字");
		thisObj.checkBox.flagPathText = thisObj.settingPanel.add("checkbox", undefined, "文字のないパス上文字");
		thisObj.checkBox.flagHairline = thisObj.settingPanel.add("checkbox", undefined, "ヘアラインパス");

		thisObj.optionGroup = thisObj.dlg.add("group", undefined);
		thisObj.optionGroup.alignment = "left";
		thisObj.optionGroup.margins = [unit*0, unit/2, unit*0, unit/2];
		thisObj.optionGroup.orientation = "column";

		thisObj.checkBox.notDelete = thisObj.optionGroup.add("checkbox", undefined, "削除せずに選択する");
		thisObj.checkBox.delLockObject = thisObj.optionGroup.add("checkbox", undefined, "ロック、非表示オブジェクトも対象にする");
		thisObj.checkBox.showAlert = thisObj.optionGroup.add("checkbox", undefined, "実行後に報告メッセージを表示する");

		for (var key in thisObj.checkBox) {
			thisObj.checkBox[key].value = settings[key];
			thisObj.checkBox[key].alignment = "left";
		}

		thisObj.buttonGroup = thisObj.dlg.add("group", undefined);
		thisObj.buttonGroup.margins = [unit, unit*0, unit, unit*0];
		thisObj.buttonGroup.alignment = "center";
		thisObj.buttonGroup.orientation = "row";
		thisObj.cancel = thisObj.buttonGroup.add("button", undefined, "キャンセル", {name: "cancel"});
		thisObj.ok = thisObj.buttonGroup.add("button", undefined, "実行", { name:"ok"});

		thisObj.ok.onClick = function() {
			for (var key in thisObj.checkBox) {
				settings[key] = thisObj.checkBox[key].value;
			}
			if (settings.delLockObject && settings.notDelete) {
				var stemsAmount = confirm("今の設定では、以下のロックと非表示が解除されます。続けますか？\n・対象オブジェクトすべて\n・対象オブジェクトが存在するすべてのレイヤー");
				if (!stemsAmount) return;
			}
			thisObj.closeDialog();
			try {
				deleteItems();
			} catch(e) {
				alert("以下のエラーが発生しましたので処理を中止します\n" + e);
			}
		}
		thisObj.cancel.onClick = function() {
			thisObj.closeDialog();
		}

	};
	mainDialog.prototype.showDialog = function() {
		this.dlg.show();
	};
	mainDialog.prototype.closeDialog = function() {
		this.dlg.close();
	};
	var dialog = new mainDialog();
	dialog.showDialog();

	// Main Process
	function deleteItems(){

		// Get layers and items
		var layers = app.activeDocument.layers;
		var items = app.activeDocument.pageItems;
		var layerProp = [];
		var foundSymbol = false;

		// Get layer propaties
		for (var i = 0; i < layers.length; i++) {
			layerProp[i] = {locked:layers[i].locked, visible:layers[i].visible};

			// Deselect all items
			if (settings.notDelete) layers[i].hasSelectedArtwork = false;
		}

		// Array of delete items
		var deleteCollection = [];

		// Get delete items
		for (var i = 0; i < items.length; i++) {

			// Layer to unlock, Layer to visualize
			if (items[i].layer.locked || !items[i].layer.visible) {
				if (settings.delLockObject) {
					items[i].layer.locked = false;
					items[i].layer.visible = true;
				} else {
					continue;
				}
			}

			// Add detele collection
			if (isTarget(items[i])) {
				if (settings.delLockObject) {
					try {
						items[i].locked = false;
						items[i].hidden = false;
					} catch(e) {
						throw "アイテムのロック解除、または表示切り替えができません[ " + e + " ]";
						return;
					} finally {
						deleteCollection.push(items[i]);
					}
				} else if (!isLockAndHide(items[i])){
					deleteCollection.push(items[i]);
				}
			}
		}

		// Counter of delete imtes
		var delCount = {'pathItem':0, 'pointText':0, 'areaText':0, 'pathText':0, 'hairLinePath':0};

		// Delete items
		for (var i = 0; i < deleteCollection.length; i++) {
			try {
				if (deleteCollection[i].typename == 'TextFrame'){
					switch(deleteCollection[i].kind){
						case TextType.POINTTEXT:
							delCount.pointText++;
							break;
						case TextType.AREATEXT:
							delCount.areaText++;
							break;
						case TextType.PATHTEXT:
							delCount.pathText++;
							break;
						default :
							break;
					}
				} else if (deleteCollection[i].typename == 'PathItem') {
					if (isHairlinePath(deleteCollection[i])){
						delCount.hairLinePath++;
					} else {
						delCount.pathItem++;
					}
				}
				if (settings.notDelete) {
					deleteCollection[i].selected = true;
				} else {
					deleteCollection[i].remove();
				}
			} catch(e) {
				throw "アイテムの削除ができません[ " + e + " ]";
				return;
			}
		}

		// Restore layer propaties
		if (!settings.notDelete) {
			for (var i = 0; i < layers.length; i++) {
				layers[i].locked = layerProp[i].locked;
				layers[i].visible = layerProp[i].visible;
			}
		}

		// Show Report
		if (settings.showAlert) showMessage(delCount);

	}

	// Get target
	function isTarget(item) {

		var isTarget = false;

		// Case of text item
		if (item.typename == 'TextFrame'){
			if (item.contents.length < 1) {

				// Point text
				if (item.kind == TextType.POINTTEXT && settings.flagPointText) isTarget = true;

				// Area text
				if (item.kind == TextType.AREATEXT && settings.flagAreaText) isTarget = true;

				// Path text
				if (item.kind == TextType.PATHTEXT && settings.flagPathText) isTarget = true;
			}

		// Case of path item
		} else if (item.typename == 'PathItem') {
			if (item.pathPoints.length < 2 && item.length <= 0 && settings.flagPathItem) {
				isTarget = true;
			} else if (item.pathPoints.length > 1 && settings.flagHairline && isHairlinePath(item)) {
				isTarget = true;
			}

		// Case of symbol item
		} else if (item.typename == 'SymbolItem') {
			foundSymbol = true;
		}
		return isTarget;
	}

	// Get locked or hidden
	function isLockAndHide(item) {
		var b = false;
		if (item.locked || item.hidden) b = true;
		return b;
	}

	// Get hairline path
	function isHairlinePath(item) {
		var b = true;
		if (!item.filled || item.stroked || !isAllStraght(item) || item.pathPoints.length < 2) b = false;
		if (b) {
			var allAspectRaito = getAllAspectRaito(item.pathPoints);
			var baseRaito = Math.max.apply(null, allAspectRaito);
			if(baseRaito != 0){
				b = false;
			} else {
				for(var i=0; i<allAspectRaito.length; i++){
					if (allAspectRaito[i] != 0 && baseRaito != allAspectRaito[i]) {
						b = false;
					}
				}
			}
		}
		return b;

		function getAllAspectRaito(points) {
			var allAspectRaito = [];
			for (var i = 0; i < points.length-1; i++){
				var basePoint = {x:points[i].anchor[0], y:points[i].anchor[1]};
				var nextPoint = {x:points[i+1].anchor[0], y:points[i+1].anchor[1]};
				if ((basePoint.x-nextPoint.x) == 0 || (basePoint.y-nextPoint.y) == 0) {
					allAspectRaito[i] = 0;
				} else if (basePoint.x == nextPoint.x && basePoint.y == nextPoint.y){
					allAspectRaito[i] = 0;
				} else {
					allAspectRaito[i] = Math.round((basePoint.x-nextPoint.x)/(basePoint.y-nextPoint.y)*HAIRLINE_ACCURACY)/HAIRLINE_ACCURACY;
				}
			}
			return allAspectRaito;
		}

		function isAllStraght(item) {
			for(var i=0; i<item.pathPoints.length; i++){
				if (hasDirection(item.pathPoints[i])){
					return false;
					break;
				}
			}
			return true;
		}

		function hasDirection(point) {
			var posX = [point.anchor[0], point.leftDirection[0], point.rightDirection[0]];
			var posY = [point.anchor[1], point.leftDirection[1], point.rightDirection[1]];
			var objX = {max:Math.max.apply(null, posX), min:Math.min.apply(null, posX)};
			var objY = {max:Math.max.apply(null, posY), min:Math.min.apply(null, posY)};
			if (objX.max == objX.min && objY.max == objY.min) {
				return false;
			}
			return true;
		}

	}

	// Show Message
	function showMessage(delCount) {
		var messageStr = '対象のオブジェクトが見つかりませんでした';
		var actionStr = '削除';
		var totalCount = delCount.pathItem + delCount.pointText + delCount.areaText + delCount.pathText + delCount.hairLinePath;
		if (settings.notDelete) actionStr = '選択';
		if (totalCount <= 0) {
			messageStr = actionStr + messageStr;
		} else {
			messageStr = '合計 ' + totalCount + ' 点のオブジェクトを' + actionStr + 'しました。\n';
			if (delCount.pathItem > 0) messageStr = messageStr + '・孤立点 ' + delCount.pathItem  + ' 点\n';
			if (delCount.pointText > 0) messageStr = messageStr + '・文字のないポイント文字 ' + delCount.pointText + ' 点\n';
			if (delCount.areaText > 0) messageStr = messageStr + '・文字のないエリア内文字 ' + delCount.areaText + ' 点\n';
			if (delCount.pathText > 0) messageStr = messageStr + '・文字のないパス上文字 ' + delCount.pathText + ' 点\n';
			if (delCount.hairLinePath > 0) messageStr = messageStr + '・ヘアラインパス ' + delCount.hairLinePath + ' 点';
		}
		alert(messageStr);
		// if (foundSymbol) alert("注意\nドキュメントにシンボルが含まれています。シンボルの中の孤立点などはチェックできませんのでご注意ください。");
	}

}());