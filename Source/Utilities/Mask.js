/*
Script: Mask.js
	Defines Mask: functionality to overlay the element contents with a semi-transparent layer that prevents interaction with page content until it is removed

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Mask = new Class({

	Binds: ['resize'],

	Extends: Art.Widget,

	style: {

		base: {
			display:'block',
			position:'relative',
			top:0,
			left:0,	
			'z-index':5000,
			'background-color':'#333',
			opacity:0.8
		},

		hidden: {
			display: 'none'
		}

	},

	options: {
		//injectWhere: null,
		elementsToHide: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac)) ? 'select, embed, object' : null,
		hideOnClick: false,
		id: null
	},

	initialize: function(target, options){
		this.setOptions(options);
		this.target = $(target) || document.body;
		if (this.target == document.body && !Browser.Engine.trident4) this.style.base.position = 'fixed';
		this.style.base = $merge(this.style.base, {
			width:(window.getScrollSize().x),
			height:(window.getScrollSize().y)
		}, this.options.style);
		this.parent();
		this.inject();
	},

	inject: function(target, where){
		var where = where || this.options.injectWhere || this.target == document.body ? 'inside' : 'after';
		this.element.inject(this.target, where);
	},

	resize: function(){
		this.element.setStyles({
			width:(this.target.getScrollSize().x),
			height:(this.target.getScrollSize().y)
		});
	},

	show: function(){
		this.target.addEvent('resize', this.resize);
		this.togglePopThroughElements(0);
		return this.parent.apply(this, arguments);
	},

	hide: function(){
		this.togglePopThroughElements(1);
		this.target.removeEvent('resize', this.resize);
		return this.parent.apply(this, arguments);
	},

	togglePopThroughElements: function(opacity){
		if (this.options.elementsToHide) {
			this.target.getElements(this.options.elementsToHide).each(function(sel){
				sel.setStyle('opacity', opacity);
			});
		}
	}

});