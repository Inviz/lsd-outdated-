Widget.Module.Attributes = new Class({
  
  initialize: function() {
	  this.pseudos = (new ART.Hash).concat(this.pseudos);
		this.classes = (new ART.Hash).concat(this.classes).concat(this.options.classes);
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
    if (!ART.Widget.Ignore.attributes[attribute]) {
      this.attributes[attribute] = value;
  		if (this.update) this.update();
  	}
  },

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
		if (this.update) this.update();
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
		if (this.update) this.update();
	},

  addClass: function(name) {
    if (this.element) this.element.addClass(name);
		if (this.update) this.update();
  },

  removeClass: function(name) {
    if (this.element) this.element.removeClass(name);
		if (this.update) this.update();
  }
})