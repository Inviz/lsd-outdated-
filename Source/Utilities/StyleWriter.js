/*
Script: StyleWriter.js

	Provides a simple method for injecting a css style element into the DOM if it's not already present.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

var StyleWriter = new Class({
	createStyle: function(css, id) {
		window.addEvent('domready', function(){
			try {
				if ($(id) && id) return;
				var style = new Element('style', {id: id||''}).inject($$('head')[0]);
				if (Browser.Engine.trident) style.styleSheet.cssText = css;
				else style.set('text', css);
			}catch(e){dbug.log('error: %s',e);}
		}.bind(this));
	}
});