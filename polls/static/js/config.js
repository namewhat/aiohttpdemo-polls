'use strict';
/**
 * 替换所有匹配exp的字符串为指定字符串
 * @param exp 被替换部分的正则
 * @param newStr 替换成的字符串
 */
String.prototype.replaceAll = function (exp, newStr) {
	return this.replace(new RegExp(exp, "gm"), newStr);
};

/**
 * 原型：字符串格式化
 * @param args 格式化参数值
 */
String.prototype.format = function(args) {
	var result = this;
	if (arguments.length < 1) {return result;}

	var data = arguments; // 如果模板参数是数组
	if (arguments.length === 1 && typeof (args) === "object") {// 如果模板参数是对象
		data = args;
	}
	for ( var key in data) {
		var value = data[key];
		if (undefined != value) {
			result = result.replaceAll("\\{" + key + "\\}", value);
		}
	}
	return result;
}

/**
 * 配置类
 */
class Config {
	constructor(apps) {
		this.apps = apps;
		this.setTplSymbol();
	}

	// 修改angular的输出模板，以防与jinja2模板引擎冲突
	setTplSymbol() {
		for (let i in this.apps) {
			this.apps[i].config(['$interpolateProvider', function($interpolateProvider) {
			  $interpolateProvider.startSymbol('{[');
			  $interpolateProvider.endSymbol(']}');
			}]);
		}
	}

	static getValueById(id) {
		return document.getElementById(id).value;
	}

	static setAttributeById(id, style) {
		document.getElementById(id).setAttribute('style', style);
	}

	// 自定义触发事件
	static trigger(element, str_event) {
		var event;
		if (document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(str_event, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = str_event;
		}

		event.eventName = str_event;

		if (document.createEvent) {
			element.dispatchEvent(event);
		} else {
			element.fireEvent('on' + event.eventType, event);
		}
	}
}
