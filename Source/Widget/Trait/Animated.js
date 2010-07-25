Widget.Trait.Animated = new Class({
	
	getAnimation: function() {
		if (!this.animation) this.animation = this.getAnimatedElement().get('fade');
		return this.animation;
	},
  
	show: function() {
	  var parent = this.parent;
		this.getAnimation().start('in').chain(function() {
		  ART.Widget.prototype.show.apply(this, arguments);
		}.bind(this))
	},
	
	hide: function() {
	  var parent = this;
		this.getAnimation().start('out').chain(function() {
		  ART.Widget.prototype.hide.apply(this, arguments);
		}.bind(this))
	},
	
	remove: function() {
		return this.getAnimation().start('out').chain(this.dispose.bind(this));
	},
	
	dispose: function() {
		return this.getAnimatedElement().dispose()
	},
	
	getAnimatedElement: function() {
	  return this.element;
	}
	
});