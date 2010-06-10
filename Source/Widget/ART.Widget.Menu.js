ART.Sheet.define('menu', {
  'background-color': hsb(0, 0, 100),
  'shadow-color': hsb(0, 0, 30, 0.6),
  'shadow-blur': 15,
  'shadow-offset-y': 3,
  'stroke-color': hsb(0, 0, 30, 0.4),
  'stroke-width': 1,
  'corner-radius': 3,
  'width': 150,
  'height': 'auto',
  'z-index': 250,
	'padding-top': 5,
	'padding-bottom': 5
})

ART.Widget.Menu = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Animated
  ),
  
  position: 'absolute',
  
  name: 'menu',
  
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
	}
});