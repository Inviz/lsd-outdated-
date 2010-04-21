(function() {
	var properties = [
		'glyphColor', 'glyphShadow', 'glyphSize', 'glyphStroke', 'glyph', 'glyphColor', 'glyphColor', 'glyphHeight', 'glyphWidth', 'glyphTop', 'glyphLeft', 		
		'cornerRadius', 'cornerRadiusTopLeft', 'cornerRadiusBottomLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight',		
		'reflectionColor',  'backgroundColor', 'strokeColor',
		'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'
	];
	//properties = properties.concat(Hash.getKeys(ART.Adapter.prototype.style).map(function(e) { return e.camelCase() }));
	
	ART.Styles = {};
	properties.each(function(prop) {
		ART.Styles[prop] = true;
	});
	
	ART.ComplexStyles = {
		'cornerRadius': {
			set: ['cornerRadiusTopLeft', 'cornerRadiusBottomLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight'],
			get: ['cornerRadiusTopLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomLeft', 'cornerRadiusBottomRight']
		}
	}
})();


ART.Widget.Paint = new Class({
  Extends: Class.inherit(
		ART.Widget.Base,
		Widget.Stateful({
			'outdated': ['outdate', 'actualize']
		})
	),
	
	properties: [],
	redraws: 0,
  
  offset: {
    paint: {}
  },
  
	build: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.paint = new ART();
		this.element.setStyle('position', this.position || 'relative');
		$(this.paint).setStyles({
			'position': 'absolute',
			'top': 0,
			'left': 0
		}).inject(this.getWrapper());
		return true;
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.paint) return;
		if (!this.outdated) return;
		
		
	  if (!this.layered) {
	    this.layered = true;
	    this.paint.push.apply(this.paint, Hash.getValues(this.layers))
	  }
	  
		this.outdated = false;
		
		var padding = this.getPadding();
		for (var property in padding) if (true) {
		  this.element.setStyle('padding-' + property, padding[property]);
		}
		this.offset.padding = padding;
		
		this.fireEvent('redraw');
		this.redraws++;
		ART.Widget.Paint.redraws++;
		
		return true;
	},
	
	getCanvasOffset: function() {
		var blur = (this.styles.current.shadowBlur || 0);
		var offset = {
			x: (this.styles.current.shadowOffsetX || 0),
			y: (this.styles.current.shadowOffsetY || 0)
		}
		return {
			left: blur + offset.x,
			top: blur - offset.y,
			right: blur + offset.x,
			bottom: blur - offset.y
		}
	},
	
	getPaintOffset: function() {
		var offset = this.getCanvasOffset();
		var stroke = (this.styles.current.strokeWidth || 0) ;
		for (var side in offset) if (offset[side] < stroke) offset[side] = stroke;
    return offset;
	},
	
	getPaintOffsetXY: function(offset) {
		if (!offset) offset = this.getPaintOffset();
		return {
			x: offset.left,
			y: offset.top
		}
	},
	
	getOffset: function() {
		return this.getPaintOffset();
	},
	
	getPadding: function() {
		var stroke = (this.styles.current.strokeWidth || 0);
		return {
			top: stroke + (this.styles.current.paddingTop || 0),
			left: stroke + (this.styles.current.paddingLeft || 0),
			bottom: stroke + (this.styles.current.paddingBottom || 0),
			right: stroke + (this.styles.current.paddingRight || 0)
		}
	},
	
	setHeight: function(value) {
		if (!this.parent.apply(this, arguments)) return;
		var offset = this.getCanvasOffset();
		if (this.paint) this.paint.setHeight(value + offset.top + offset.bottom);
		return true;
	},
		
	setWidth: function(value) {
		if (!this.parent.apply(this, arguments)) return;
		var offset = this.getCanvasOffset();
		if (this.paint) this.paint.setWidth(value + offset.left + offset.right);
		return true;
	},
	
	inheritStyle: function(property) {
		switch (property) {
			case "height": case "width":
				this.outdated = true;
		}
		return this.parent.apply(this, arguments);
	},
	
	calculateStyle: function(property) {
		switch (property) {
			case "height": case "width":
				this.outdated = true;
		}
    return this.parent.apply(this, arguments);
	},
	
	setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		switch(property) {
			case "height": case "width":
				this.outdated = true;
		}
		return (this.setPaintStyle(property, value) || this.setElementStyle(property, value));
	},
	
	getStyle: function(property, value) {
		var properties = ART.ComplexStyles[property];
		if (properties) {
			if (properties.set) properties = properties.get;
			return properties.map(function(property) {
				return this.getStyle(property) || 0;
			}, this)
		} else {
			return this.parent.apply(this, arguments);
		}
	},
	
	setPaintStyle: function(property, value) {
		if (ART.Styles[property] || this.properties.contains[property]) {
			this.styles.paint[property] = /*this.paint.style[property] = */value;
			var properties = ART.ComplexStyles[property];
			if (properties) {
				if (properties.set) properties = properties.set;
				if (!(value instanceof Array)) {
					var array = [];
					for (var i = 0, j = properties.length; i < j; i++) array.push(value); 
					value = array;
				}
				var count = value.length;
				
				properties.each(function(property, i) {
					this.setStyle(property, value[i % count])
				}, this);
			}
			this.outdated = true;
			return true;
		}	
		return false;
	}
	
});

ART.Widget.Paint.Fx = new Class({

	Extends: Fx.CSS,

	initialize: function(widget, options){
	  this.widget = widget;
		this.element = this.subject = document.id(widget);
		this.parent(options);
	},

	prepare: function(widget, property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = widget.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},
	
	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.widget.setStyle(property, now[0].value);
		this.widget.render();
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.widget, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

ART.Widget.Paint.implement({
  tween: function(property, from, to) {
    if (!this.tweener) this.tweener = new ART.Widget.Paint.Fx(this, this.options.tween);
    this.tweener.start(property, from, to);
    return this;
  }
});

ART.Widget.Paint.redraws = 0;