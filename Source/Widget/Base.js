if (!window.Widget) Widget = {};
Widget.Base = new Class({
  
  Implements: [Options, Events, Logger],
  
  initialize: function(options) {
  	if (options) this.setOptions(options);  
  },
  
	toElement: function(){
		this.build();
		return this.element;
	},

	onStateChange: function(state, value, args) {
	  var args = $A(arguments);
	  args.splice(1, 2); //state + args

		if (Widget.Ignore.states[state]) return;
    this[value ? "setState" : "unsetState"].apply(this, args);
    if (this.redraws > 0) this.refresh();
    return true;
  },

  addClass: function(name) {
    if (this.element) this.element.addClass(name);
  },

  removeClass: function(name) {
    if (this.element) this.element.removeClass(name);
  },
  
  setState: function(state) {
    this.addClass('is-' + state);
		this.addPseudo(state);
  },
  
  unsetState: function(state) {
    this.removeClass('is-' + state);
		this.removePseudo(state);
  },

	dispose: function() {
	  this.element.dispose();
	},
	
	onWidgetReady: function(callback) {
	  this.onDOMInject(callback.bind(this))
	},

	onDOMInject: function(callback) {
	  var root = this.getRoot();
	  if (!root.parentWidget && root.parentNode) callback(root) 
	  else this.addEvent('dominject', callback)
	},
	
	addAction: function(options) {
	  this.addEvents({
	    enable:  options.enable.bind(this),
	    attach:  options.enable.bind(this),
	    disable: options.disable.bind(this),
	    detach:  options.disable.bind(this)
	  });
	  this.onWidgetReady(function() {
	    if (!this.disabled) options.enable.call(this);
	  });
	  return true;
	},
	
	onChange: function() {
	  this.fireEvent('change', arguments)
	  return true;
	},
	
	getWrapper: function() {
	  return this.wrapper || this.element;
	},
	
	addPseudo: function() {},
	removePseudo: function() {}
});
Widget.Module = {};
Widget.Trait = {};
Widget.Ignore = [];
['events', 'states', 'attributes', 'styles'].each(function(type) {
  Widget.Ignore[type] = new ART.Hash
});