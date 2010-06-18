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