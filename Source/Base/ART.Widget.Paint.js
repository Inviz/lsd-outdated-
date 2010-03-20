(function() {
	var properties = [
		'glyphColor', 'glyphShadow', 'glyphSize', 'glyphStroke', 'glyph', 'glyphColor', 'glyphColor', 'glyphHeight', 'glyphWidth', 'glyphTop', 'glyphLeft', 		
		'borderRadius', 'borderRadiusTopLeft', 'borderRadiusBottomLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight',		
		'reflectionColor',  'backgroundColor', 		
		'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'		
	];
	properties = properties.concat(Hash.getKeys(ART.Adapter.prototype.style).map(function(e) { return e.camelCase() }));
	
	ART.Adapter.Styles = {};
	properties.each(function(prop) {
		ART.Adapter.Styles[prop] = true;
	});
	
	ART.Adapter.ComplexStyles = {
		'borderRadius': {
			set: ['borderRadiusTopLeft', 'borderRadiusBottomLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight'],
			get: ['borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomLeft', 'borderRadiusBottomRight']
		}
	}
})();


ART.Widget.Paint = new Class({
  Extends: Class.inherit(
		ART.Widget,
		Widget.Stateful({
			'outdated': ['outdate', 'actualize']
		})
	),
	
	properties: [],
  
	build: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.paint = new ART.Paint();
		$(this.paint).inject(this.element);
		
		this.element.setStyle('position', 'relative');
		$(this.paint).setStyles({
			'position': 'absolute',
			'top': 0,
			'left': 0
		});
		return true;
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.paint) return;
		if (!this.outdated) return;
		
		this.paint.clear();
		this.outdated = false;
		
		var padding = this.getPadding();
		for (var property in padding) {
		  this.element.setStyle(property, padding[property]);
		}
		ART.Widget.Paint.redraws++;
		
		return true;
	},
	
	setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		switch(property) {
			case "height": case "width":
				this.outdated = true;
		}
		return (this.setPaintStyle(property, value) || this.setElementStyle(property, value));
	},
	
	setElementStyle: function(property, value) {
  	switch(property) {
  		case "paddingLeft": case "paddingRight": case "paddingBottom": case "paddingTop":
  		  this.outdated = true;
  	}
	  return this.parent.apply(this, arguments);
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
		var stroke = (this.styles.current.strokeWidth || 0) / 2;
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
		var stroke = (this.styles.current.strokeWidth || 0) / 2;
		return {
			paddingTop: stroke + (this.styles.current.paddingTop || 0),
			paddingLeft: stroke + (this.styles.current.paddingLeft || 0),
			paddingBottom: stroke + (this.styles.current.paddingBottom || 0),
			paddingRight: stroke + (this.styles.current.paddingRight || 0)
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
	
	setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		switch(property) {
			case "height": case "width":
				this.outdated = true;
		}
		return (this.setPaintStyle(property, value) || this.setElementStyle(property, value));
	},
	
	getPaintStyle: function(property, value) {
		var properties = ART.Adapter.ComplexStyles[property];
		if (properties) {
			if (properties.set) properties = properties.get;
			return properties.map(function(property) {
				return this.getStyle(property) || 0;
			}, this)
		} else {
			return this.getStyle.apply(this, arguments);
		}
	},
	
	setPaintStyle: function(property, value) {
		if (ART.Adapter.Styles[property] || this.properties.contains[property]) {
			this.styles.paint[property] = this.paint.style[property] = value;
			var properties = ART.Adapter.ComplexStyles[property];
			if (properties) {
				if (properties.set) properties = properties.set;
				if ($type(value) != "array") {
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


ART.Widget.Paint.redraws = 0;