Widget.Module.Attributes = new Class({
  initialize: function() {
		this.classes = (this.classes || []).concat(this.options.classes);
		if (!this.attributes) this.attributes = {};
		for (var attribute in this.options.attributes) this.setAttribute(attribute, this.options.attributes[attribute]);
		return this.parent.apply(this, arguments);
  },
  
  getAttribute: function(attribute) {
    switch (attribute) {
      case "id": return this.options.id;
      case "class": return this.classes.join(' ');
      default:   return this.attributes[attribute]
    }
  },

  setAttribute: function(attribute, value) {
    if (!ART.Widget.Ignore.attributes[attribute]) this.attributes[attribute] = value;
  },

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
	},

  addClass: function(name) {
    if (this.element) this.element.addClass(name);
  },

  removeClass: function(name) {
    if (this.element) this.element.removeClass(name);
  }
})