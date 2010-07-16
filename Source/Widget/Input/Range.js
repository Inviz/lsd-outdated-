ART.Widget.Input.Range = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Trait.HasSlider,
    ART.Widget.Trait.Focusable,
    ART.Widget.Trait.Accessible
  ),
  
  name: 'input',
	
	layered: {
	  shadow: ['shadow'],
    border: ['stroke'],
	  background: ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']]
	},
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.addPseudo(this.options.mode);
	  this.getSlider();
	},

	onSet: function() {
	  this.focus();
	},
	
	layout: {
    'input-range-thumb#thumb': {}
	},
	
	shortcuts: {
	  next: 'increment',
	  previous: 'decrement'
	},
	
	increment: function() {
	  this.slider.set(this.slider.step + 10)
	},
	
	decrement: function() {
	  this.slider.set(this.slider.step - 10)
	}
})

ART.Widget.Input.Range.Thumb = new Class({
  Extends: Class.inherit(
    ART.Widget.Button
  ),
  
  name: 'thumb'
});