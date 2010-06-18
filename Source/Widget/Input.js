ART.Widget.Input = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasInput
  ),
  
  name: 'input',
  
  attributes: {
    type: 'text'
  },
  
  events: {
    element: {
  	  mousedown: 'refocus'
    }
  },
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
    glyph: ['shape-shadow']
	},
	
	focus: Macro.onion(function() {
	  this.input.focus();
	}),
	
	refocus: function() {
	  this.focus();
	},
	
	applyValue: function(item) {
	  this.input.set('value', item);
	}
});