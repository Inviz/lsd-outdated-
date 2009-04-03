/*
Script: StickyWin.js

	Creates a div within the page with the specified contents at the location relative to the element you specify; basically an in-page popup maker.
	Extends Art.Widget to add the following features:
	* positioning
	* iframeshim integration
	* pinning
	* content assignment
	* unique use (only one instance at a time; only one by css-class)
	* group management (hide all instances, zindex management, minimize, maximize, etc) << not done yet.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var StickyWin = new Class({

	Extends: Art.Widget,

	Implements: [Options, Events],

	Binds: ['destroy', 'hide', 'togglepin'],

	options: {/*
		id: ... default set in initialize function
		these are the defaults for Element.position anyway
		************************************************
		edge: false, //see Element.position
		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
		offset: {x:0,y:0},
		relativeTo: document.body,
		************************************************
		width: false,
		height: false, */
		closeClassName: 'closeSticky',
		pinClassName: 'pinSticky',
		content: '',
		zIndex: 10000,
		className: '',
		timeout: -1,
		allowMultipleByClass: false,
		allowMultiple: true,
		showNow: true,
		useIframeShim: true,
		iframeShimSelector: '',
		destroyOnClose: false
	},

	css: '.SWclearfix:after {content: "."; display: block; height: 0; clear: both; visibility: hidden;}'+
		 '.SWclearfix {display: inline-table;} * html .SWclearfix {height: 1%;} .SWclearfix {display: block;}',

	initialize: function(options){
		this.options.inject = this.options.inject || {
			target: document.body,
			where: 'bottom' 
		};
		this.setOptions(options);
		this.id = this.options.id || 'StickyWin_' + StickyWin.instances.getLength();
		StickyWin.instances.include(this);
		this.makeWindow();

		if (this.options.content) this.setContent(this.options.content);
		if (this.options.timeout > 0) {
			this.addEvent('show', function(){
				this.hide.delay(this.options.timeout, this)
			}.bind(this));
		}
		if (this.options.showNow) this.show();
		//add css for clearfix
		this.createStyle(this.css, 'StickyWinClearFix');
		if (this.options.destroyOnClose) this.addEvent('close', this.destroy)
	},

	toElement: function(){
		return this.element;
	},

	getWrapper: function(){
		this.wrapper = this.wrapper || new Element('div', {
			id: this.id
		}).addClass(this.options.className).addClass('StickyWinInstance SWclearfix').setStyles({
			display:'none',
			position:'absolute',
			zIndex:this.options.zIndex
		}).inject(this.options.inject.target, this.options.inject.where).store('StickyWin', this);
		return this.wrapper;
	},

	makeWindow: function(){
		this.destroyOthers();
		this.element = $(this.id) || this.getWrapper();

		if (this.options.width && $type(this.options.width.toInt())=="number") this.element.setStyle('width', this.options.width.toInt());
		if (this.options.height && $type(this.options.height.toInt())=="number") this.element.setStyle('height', this.options.height.toInt());
		return this;
	},

	show: function(){
		this.parent();
		if (!this.positioned) this.position();
		if (this.options.useIframeShim) this.showIframeShim();
		return this;
	},

	hide: function(){
		this.hideWin();
		if (this.options.useIframeShim) this.hideIframeShim();
		return this;
	},

	destroyOthers: function() {
		if (!this.options.allowMultipleByClass || !this.options.allowMultiple) {
			$$('div.StickyWinInstance').each(function(sw) {
				if (!this.options.allowMultiple || (!this.options.allowMultipleByClass && sw.hasClass(this.options.className))) 
					sw.retrieve('StickyWin').destroy();
			}, this);
		}
	},

	setContent: function(html) {
		this.element.empty();
		if ($type(html) == "string") this.element.set('html', html);
		else if ($(html)) this.element.adopt(html);
		//replace with delegation at some point
		this.element.getElements('.'+this.options.closeClassName).each(function(el){
			el.addEvent('click', this.hide);
		}, this);
		this.element.getElements('.'+this.options.pinClassName).each(function(el){
			el.addEvent('click', this.togglepin);
		}, this);
		return this;
	},

	position: function(options){
		this.positioned = true;
		this.setOptions(options);
		this.element.position({
			allowNegative: true,
			relativeTo: this.options.relativeTo,
			position: this.options.position,
			offset: this.options.offset,
			edge: this.options.edge
		});
		if (this.shim) this.shim.position();
		return this;
	},

	pin: function(pin) {
		//you must include element.pin.js!
		if (!this.element.pin) return this;
		this.pinned = $pick(pin, true);
		this.element.pin(pin);
		return this;
	},

	unpin: function(){ return this.pin(false); },

	togglepin: function(){ return this.pin(!this.pinned); },

	makeIframeShim: function(){
		if (!this.shim){
			var el = (this.options.iframeShimSelector)?this.element.getElement(this.options.iframeShimSelector):this.element;
			this.shim = new IframeShim(el, {
				display: false,
				name: 'StickyWinShim'
			});
		}
	},

	showIframeShim: function(){
		if (this.options.useIframeShim) {
			this.makeIframeShim();
			this.shim.show();
		}
	},

	hideIframeShim: function(){
		if (this.shim) this.shim.hide();
	},

	destroy: function(){
		this.parent();
		if (this.options.useIframeShim && this.shim) this.shim.destroy();
		return this;
	}

});

StickyWin.Manager = new Class({
	//TODO: zindex management, minimize, maximize, etc.
});

$extend(StickyWin, {
	instances: $H({}),
	hideAll: function(){
		StickyWin.instances.each(function(instance, id){
			instance.hide();
		});
	}
});