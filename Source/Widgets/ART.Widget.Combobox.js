ART.Sheet.define('combobox', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'stroke-width': 1,
	'fill-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'
	height': 20
});
ART.Sheet.define('combobox:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 5,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93, 0.3)
});


ART.Widget.Combobox = new Class({
  Extends: Class.inherit(
    ART.Widget.Select,
    ART.Widget.Traits.HasInput
  )
  
  name: 'combobox'
})