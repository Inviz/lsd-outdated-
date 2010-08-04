ART.Widget.Menu = new Class({
  Includes: [
    ART.Widget.Paint,
    Widget.Trait.Animation
  ],
  
  position: 'absolute',
  
  name: 'menu',
  
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['stroke'],
	  background:  ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']],
	}
});