ART.Widget.Input.Radio = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Trait.Touchable,
    ART.Widget.Trait.Focusable,
    ART.Widget.Trait.Accessible,
    Widget.Stateful({
      'checked': ['check', 'uncheck']
    })
  ),
  
  name: 'input',
  
  events: {
    element: {
      click: 'retain'
    }
  },
  
  shortcuts: {
    space: 'check'
  },

	layered: {
	  shadow:  ['shadow'],
    stroke: ['stroke'],
	  background:  ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']],
    glyph: ['glyph']
	},
	
	check: Macro.onion(function() {
	  if (this.attributes.name) document.getElements('.art.input[name="' + this.attributes.name + '"]').each(function(element) {
	    if (element != this.element && element.getAttribute('type') == 'radio') element.retrieve('widget').uncheck();
	  }, this)
	}),
	
	retain: function() {
	  this.check();
	  this.focus();
	}
})