/*
---

name: ART.Shapes

description: Shapes for ART

authors: [Valerio Proietti](http://mad4milk.net)

provides: [ART.Shapes, ART.Rectangle, ART.Pill, ART.Ellipse]

requires: [ART.Path, ART.Shape]

...
*/

ART.Rectangle = new Class({

	Extends: ART.Shape,
	
	properties: ['width', 'height', 'cornerRadius'],
	
	initialize: function(width, height, radius){
		this.parent();
		if (width != null && height != null) this.draw(width, height, radius);
	},
	
	draw: function(width, height, radius){
		var path = new ART.Path;

		if (!radius){

			path.move(0, 0).line(width, 0).line(0, height).line(-width, 0).line(0, -height);

		} else {

			if (typeof radius == 'number') radius = [radius, radius, radius, radius];

			var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];

			if (tl < 0) tl = 0;
			if (tr < 0) tr = 0;
			if (bl < 0) bl = 0;
			if (br < 0) br = 0;

			path.move(0, tl);

			if (width < 0) path.move(width, 0);
			if (height < 0) path.move(0, height);

			if (tl > 0) path.arc(tl, -tl);
			path.line(Math.abs(width) - (tr + tl), 0);

			if (tr > 0) path.arc(tr, tr);
			path.line(0, Math.abs(height) - (tr + br));

			if (br > 0) path.arc(-br, br);
			path.line(- Math.abs(width) + (br + bl), 0);

			if (bl > 0) path.arc(-bl, -bl);
			path.line(0, - Math.abs(height) + (bl + tl));
		}

		return this.parent(path);
	},
	
	paint: function(width, height, cornerRadius, color) {
    if (!isFinite(width) || !isFinite(height) || !color) return false;
	  this.draw(width, height, cornerRadius);
		this.fill.apply(this, $splat(color));
	}

});

ART.RectangleStroke = new Class({
  Extends: ART.Rectangle,
  
  properties: ['width', 'height', 'cornerRadius', 'strokeColor', 'strokeWidth', 'strokeCap', 'strokeDash', 'fillColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'],
  
  paint: function(width, height, cornerRadius, strokeColor, stroke, cap, dash, color, shadow, x, y) {
    if (!isFinite(width) || !isFinite(height) || (!color && !stroke)) return false;
    this.draw(width + stroke, height + stroke, cornerRadius.map(function(r) { return r + stroke / 2}));
  	this.stroke(strokeColor, stroke, cap);
  	this.fill.apply(this, color ? $splat(color) : null);
  	this.dash(dash);
  	this.translate( stroke / 2 + Math.max(shadow - x, 0), stroke / 2 + Math.max(shadow - y, 0))
  }
})

ART.RectangleShadow = new Class({
  Extends: ART.Rectangle,
  
  properties: ['width', 'height', 'cornerRadius', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'],
  
  paint: function(width, height, cornerRadius, stroke, shadow, x, y, color) {
    if (!isFinite(width) || !isFinite(height) || !color) return false;
    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  	if (color) this.fill.apply(this, $splat(color));
  	if (stroke || shadow) this.translate(stroke  + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
  }
});

ART.Shadow = new Class({
  Extends: ART.Rectangle,
    
  properties: ['width', 'height', 'cornerRadius', 'strokeWidth', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'shadowQuality'],
  
  layers: [],
  
  paint: function(width, height, cornerRadius, stroke, shadow, color, x, y, quality) {
    if (!isFinite(width) || !isFinite(height) || (!color)) return false;
    
    if (ART.Features.Blur && (quality == 'best' || shadow > 10)) {
      ART.ShadowBlur.prototype.paint.apply(this, arguments);
    } else {
      ART.ShadowOnion.prototype.paint.apply(this, arguments);
    }
  },

  inject: function(node) {
    this.parent.apply(this, arguments)
    for (var i = 0, j = this.layers.length; i < j; i++) if (this.layers[i]) this.layers[i].inject(node)
  },
  
  eject: function() {
    this.parent.apply(this, arguments)
    for (var i = 0, j = this.layers.length; i < j; i++) {
      var layer = this.layers[i];
      if (layer && layer.element.parentNode) {
        layer.element.parentNode.removeChild(layer.element);
      }
    }
  }
});

ART.ShadowOnion = new Class({
  Extends: ART.Shadow,
  
  paint: function(width, height, cornerRadius, stroke, shadow, color, x, y) {
    if (shadow > 0 || y > 0 || x > 0) {
      var fill = new Color(color);
      fill.base = fill.alpha;
      var transition = Fx.Transitions.Quint.easeIn;
      var node = this.element.parentNode;
      for (var i = 0; i < Math.max(shadow, 1); i++) {
        if (shadow == 0) {
          fill.alpha = Math.min(fill.base * 2, 1)
        } else {
          fill.alpha = fill.base / 2 * (i == shadow ? .29 : (.2 - shadow * 0.017) + Math.sqrt(i / 100));
        }
        //if (fill.alpha < 0.02) continue;
        var rectangle = this.layers[i];
        if (!rectangle) rectangle = this.layers[i] = ART.Shadow.Layer.getInstance(this);
        rectangle.shadow = this;
        rectangle.draw(width + stroke * 2 - i * 2 + shadow, height + stroke * 2 - i * 2 + shadow, cornerRadius.map(function(r) { 
          return Math.max(shadow - i, r + stroke * 2 + shadow / 2 - i)
        }))
        rectangle.translate(i + x + shadow / 2, i + y + shadow / 2);
        rectangle.fill(fill);
        if (node) {
          var layer = this.layers[i - 1];
          
          if (layer) {
            if (layer.element.nextSibling) {
              node.insertBefore(rectangle.element, layer.element.nextSibling);
            } else {
              node.appendChild(rectangle.element)
            }
          } else {
            rectangle.inject(this.container)
          }
        }
      }
      for (var i = Math.max(shadow, 1), j = this.layers.length; i < j; i++) {
        if (this.layers[i]) ART.Shadow.Layer.release(this.layers[i]);
        this.layers.splice(i, 1);
        i--;
        j--;
      }
    } else {
      this.layers.each(ART.Shadow.Layer.release);
      this.layers = [];
    }
  }
});

ART.ShadowBlur = new Class({
  Extends: ART.Shadow,

  paint: function(width, height, cornerRadius, stroke, shadow, color, x, y) {
    this.draw(width + stroke * 2, height + stroke * 2, cornerRadius.map(function(r) { return r + stroke * 2}));
  	this.fill.apply(this, color ? $splat(color) : null);
  	if (shadow > 0) this.blur(shadow);
  	else this.unblur();
  	this.translate(x + shadow, shadow + y)
  }
})

ART.Shadow.Layer = new Class({
  Extends: ART.Rectangle,
  
	
	inject: function(container){
		this.eject();
		if (container instanceof ART.SVG.Group) container.children.push(this);
		this.container = container;
		if (container.defs && container.defs.nextSibling) container.element.insertBefore(this.element, container.defs.nextSibling);
    else container.appendChild(this.element);
		return this;
	}
});
ART.Shadow.Layer.stack = [];
ART.Shadow.Layer.getInstance = function() {
  return ART.Shadow.Layer.stack.pop() || (new ART.Shadow.Layer);
}
ART.Shadow.Layer.release = function(layer) {
  layer.element.parentNode.removeChild(layer.element);
  ART.Shadow.Layer.stack.push(layer);
};

ART.Shape.implement({
  
	properties: ['glyph', 'glyphColor'],
	
  paint: function(glyph, color) {
    if (!(color && glyph)) return false;
	  this.draw(glyph);
		if (color) this.fill.apply(this, $splat(color));
	}
	
});



ART.InnerShadow = new Class({
  Extends: ART.Shadow,
  
  properties: ['width', 'height', 'cornerRadius', 'strokeWidth', 'innerShadowBlur', 'innerShadowColor', 'innerShadowOffsetX', 'innerShadowOffsetY', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'],

  paint: function(width, height, cornerRadius, stroke, shadow, color, x, y, shadowBlur, shadowOffsetX, shadowOffsetY) {
    if (shadow > 0 || y > 0 || x > 0) {
      var fill = new Color(color);
      fill.base = fill.alpha;
      var transition = Fx.Transitions.Sine;
      var node = this.element.parentNode;
      shadow += Math.max(x, y);
      //if (!shadow) shadow = 1;;
      for (var i = 0; i < shadow; i++) {
        if (shadow == 0) {
          fill.alpha = Math.min(fill.base * 2, 1)
        } else {
          fill.alpha = fill.base * transition((shadow - i) / shadow)
        }
        //if (fill.alpha < 0.02) continue;
        var rectangle = this.layers[i];
        if (!rectangle) rectangle = this.layers[i] = ART.InnerShadow.Layer.getInstance(this);
        rectangle.shadow = this;
        rectangle.draw(width - i * 2  + Math.max(0, y - x) , height - i * 2 + Math.max(0, y - x), cornerRadius)
        console.info(shadowBlur, shadowOffsetY, shadowOffsetX)
        rectangle.translate(
          i - Math.max(0, y - x) / 2 + stroke + Math.max(shadowBlur - shadowOffsetX, 0), 
          i + Math.max(0, x - y) / 2 + stroke + Math.max(shadowBlur - shadowOffsetY, 0)
        );
        rectangle.stroke(fill, 1);
        if (node) rectangle.inject(this.container)
      }
      for (var i = shadow, j = this.layers.length; i < j; i++) {
        if (this.layers[i]) ART.Shadow.Layer.release(this.layers[i]);
        this.layers.splice(i, 1);
        i--;
        j--;
      }
    } else {
      this.layers.each(ART.Shadow.Layer.release);
      this.layers = [];
    }
  }
})
ART.InnerShadow.Layer = new Class({
  Extends: ART.Rectangle
});
ART.InnerShadow.Layer.stack = [];
ART.InnerShadow.Layer.getInstance = function() {
  return ART.InnerShadow.Layer.stack.pop() || (new ART.InnerShadow.Layer);
}
ART.InnerShadow.Layer.release = function(layer) {
  layer.element.parentNode.removeChild(layer.element);
  ART.InnerShadow.Layer.stack.push(layer);
};

ART.ShapeShadow = new Class({
  
  Extends: ART.Shape,
  
  properties: ['glyph', 'glyphColor', 'glyphLeft', 'glyphTop', 'glyphScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], 
  
  paint: function(glyph, color, left, top, scale, stroke, shadow, x, y) {
    if (!color || !glyph) return false;
    this.draw(glyph);
		this.fill.apply(this, $splat(color));
		this.translate(left + stroke + Math.max(shadow - x, 0), top + stroke + Math.max(shadow - y, 0));
		if (scale) this.scale(scale, scale)
  }
  
});


ART.Pill = new Class({
	
	Extends: ART.Rectangle,
	
	draw: function(width, height){
		return this.parent(width, height, ((width < height) ? width : height) / 2);
	}
	
});

ART.Ellipse = new Class({
	
	Extends: ART.Shape,
	
	initialize: function(width, height){
		this.parent();
		if (width != null && height != null) this.draw(width, height);
	},
	
	draw: function(width, height){
		var path = new ART.Path;
		var rx = width / 2, ry = height / 2;
		path.move(0, ry).arc(width, 0, rx, ry).arc(-width, 0, rx, ry);
		return this.parent(path);
	}

});

ART.Wedge = new Class({

	Extends: ART.Shape,

	initialize: function(innerRadius, outerRadius, startAngle, endAngle){
		this.parent();
		if (innerRadius != null || outerRadius != null) this.draw(innerRadius, outerRadius, startAngle, endAngle);
	},

	draw: function(innerRadius, outerRadius, startAngle, endAngle){
		var path = new ART.Path;

		var circle = Math.PI * 2,
			radiansPerDegree = Math.PI / 180,
			sa = startAngle * radiansPerDegree % circle || 0,
			ea = endAngle * radiansPerDegree % circle || 0,
			ir = Math.min(innerRadius || 0, outerRadius || 0),
			or = Math.max(innerRadius || 0, outerRadius || 0),
			a = sa > ea ? circle - sa + ea : ea - sa;

		if (a >= circle){

			path.move(0, or).arc(or * 2, 0, or).arc(-or * 2, 0, or);
			if (ir) path.move(or - ir, 0).counterArc(ir * 2, 0, ir).counterArc(-ir * 2, 0, ir);

		} else {

			var ss = Math.sin(sa), es = Math.sin(ea),
				sc = Math.cos(sa), ec = Math.cos(ea),
				ds = es - ss, dc = ec - sc, dr = ir - or,
				large = a > Math.PI;

			path.move(or + or * ss, or - or * sc).arc(or * ds, or * -dc, or, or, large).line(dr * es, dr * -ec);
			if (ir) path.counterArc(ir * -ds, ir * dc, ir, ir, large);

		}

		path.close();
		return this.parent(path);
	}

});