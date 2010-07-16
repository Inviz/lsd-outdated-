ART.Widget.Menu = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Animated
  ),
  
  position: 'absolute',
  
  name: 'menu',
  
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['stroke'],
	  background:  ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']],
	}
});