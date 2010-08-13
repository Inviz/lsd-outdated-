Widget.Trait.Animation = new Class({
	options: {
	  animation: {}
	},
	
	getAnimation: function() {
		if (!this.animation) {
		  this.animation = this.getAnimatedElement().set('tween', this.options.animation).get('tween');
		  if (this.options.animation.value) this.animation.set(this.options.animation.value);
		}
		return this.animation;
	},
  
	show: function() {
	  var parent = this.parent;
		this.getAnimation().start('opacity', 1).chain(function() {
		  ART.Widget.prototype.show.apply(this, arguments);
		}.bind(this))
	},
	
	hide: function(how) {
	  var parent = this;
		this.getAnimation().start('opacity', 0).chain(function() {
		  ART.Widget.prototype.hide.apply(this, arguments);
		}.bind(this))
	},
	
	remove: function() {
		return this.getAnimation().start('opacity', 0).chain(this.dispose.bind(this));
	},
	
	dispose: function() {
		return this.getAnimatedElement().dispose()
	},
	
	getAnimatedElement: function() {
	  return this.element;
	}
	
});