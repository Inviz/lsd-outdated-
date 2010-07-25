ART.Widget.Input.Checkbox = new Class({
  Includes: [
    ART.Widget.Paint,
    ART.Widget.Trait.Touchable,
    ART.Widget.Trait.Focusable,
    ART.Widget.Trait.Accessible,
    Widget.Stateful({
      'checked': ['check', 'uncheck', 'toggle']
    })
  ],
  
  name: 'input',
  
  events: {
    element: {
      click: 'retain'
    }
  },
  
  shortcuts: {
    space: 'toggle'
  },

	layered: {
	  shadow:  ['shadow'],
    stroke: ['stroke'],
	  background:  ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']],
    glyph: ['glyph']
	},

	retain: function() {
	  this.toggle();
	  this.focus();
	}
})