ART.Widget.Input.Checkbox = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.Touchable,
    ART.Widget.Traits.Focusable,
    ART.Widget.Traits.Accessible,
    Widget.Stateful({
      'checked': ['check', 'uncheck', 'toggle']
    })
  ),
  
  name: 'input',
  
  events: {
    element: {
      click: 'toggle'
    }
  },
  
  shortcuts: {
    space: 'toggle'
  },

	layered: {
	  shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
    glyph: ['shape-shadow']
	},

	retain: function() {
	  this.toggle();
	  this.focus();
	}
})