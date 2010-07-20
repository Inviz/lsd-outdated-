ART.Shape.Rectangle = new Class({

	Extends: ART.Shape,
	
	properties: ['width', 'height', 'cornerRadius'],
	
	initialize: function(width, height, radius){
		this.parent();
		if (width != null && height != null) this.draw(width, height, radius);
	},
	
	paint: function(width, height, radius) {
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
		
		return path;
	},
	
	render: function(){
		return this.draw(this.paint.apply(this, arguments));
	},
	
	change: function(delta) {
	  return this.paint(this.style.width + delta * 2, this.style.height + delta * 2, this.style.cornerRadius.map(function(r) {
	    return r + delta
	  }))
	},
	
	getOffset: function(styles, offset) {
		var stroke = (styles.strokeWidth || 0);
		return {
			left: ((styles.width == 'auto') ? Math.max(stroke - offset.left, 0) : stroke),
			top: 0,
			right: stroke,
			bottom: stroke
		}
	}
});