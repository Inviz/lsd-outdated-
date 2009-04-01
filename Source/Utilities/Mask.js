/*
Script: Mask.js
	Defines Mask: functionality to overlay the element contents with a semi-transparent layer that prevents interaction with page content until it is removed

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

var Mask = new Class({

	Binds: ['resize'],

	Extends: ART.Widget,

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
		useIframeShim: true,
		elementsToHide: 'select, embed, object',
		hideElements: false,
		hideOnClick: false,
		id: null
	},

	initialize: function(target, options){
		this.target = $(target) || document.body;
		if (this.target == document.body) {
			if(!Browser.Engine.trident4) this.style.base.position = 'fixed';
			this.options.useIframeShim = false;
			this.options.hideElements = true;
		}
		this.setOptions(options);
		this.style.base = $merge(this.style.base, {
			width:(this.target.getScrollSize().x),
			height:(this.target.getScrollSize().y)
		}, this.options.style);
		this.parent();
		this.inject();
	},

	position: function(){
		var dim = this.target.getComputedSize();
		this.element.setStyles({
			width: this.style.base.width||dim.totalWidth,
			height: this.style.base.height||dim.totalHeight,
		}).position({
			relativeTo: this.target,
			position: 'upperLeft'
		});
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
		this.position();
		this.togglePopThroughElements(0);
		return this.parent.apply(this, arguments);
	},

	hide: function(){
		this.togglePopThroughElements(1);
		this.position();
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

Element.Properties.mask = {

	set: function(options){
		var mask = this.retrieve('mask');
		return this.eliminate('mask').store('mask:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('mask')){
			if (options || !this.retrieve('mask:options')) this.set('mask', options);
			this.store('mask', new Mask(this, this.retrieve('mask:options')));
		}
		return this.retrieve('mask');
	}

};

Element.implement({

	mask: function(options){
		this.get('mask', options).show();
		return this;
	},

	unmask: function(options){
		this.get('mask', options).hide();
		return this;
	}

});