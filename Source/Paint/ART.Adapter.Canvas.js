/*
Script: ART.Adapter.Canvas.js

License:
	MIT-style license.
*/

ART.Adapter.Canvas = new Class({
	
	Extends: ART.Adapter,
	
	initialize: function(id, width, height){
		this.id = id || 'c-' + $time();
		if (width && height) this.resize({x: width, y: height});
		this.parent();
	},
	
	getElement: function(id) {
		if (!this.element) this.element = new Element('canvas', {'id': id || this.id});
		return this.element;
	},
	
	getContext: function() {
		if (!this.context) this.context = this.getElement().getContext('2d');
		return this.context;
	},
	
	toElement: function() {
		return this.getElement();
	},
	
	/* canvas implementation */
	
	resize: function(size){
		if (size.x) this.setWidth(size.x);
		if (size.y) this.setHeight(size.y);
		return this;
	},
	
	setWidth: function(width) {
		this.getElement().width = width;
	},
	
	setHeight: function(height) {
		this.getElement().height = height;
	},
	
	start: function(vector){
		this.getContext().beginPath();
		return this.parent(vector);
	},
	
	join: function(){
		this.getContext().closePath();
		return this.parent();
	},
	
	moveTo: function(vector){
		
		var now = this.parent(vector);
		this.getContext().moveTo(now.x, now.y);
		return this;
	},
	
	lineTo: function(vector){
		var now = this.parent(vector);
		this.getContext().lineTo(now.x, now.y);
		return this;
	},

	bezierTo: function(c1, c2, end){
		var now = this.parent(c1, c2, end);
		this.getContext().bezierCurveTo(now[0].x, now[0].y, now[1].x, now[1].y, now[2].x, now[2].y);
		return this;
	},
	
	end: function(style){
		this.started = false;
		//console.log('end', style)
		//style = this.sanitizeStyle(style);
		var ctx = this.getContext();
		for (var key in style){
			var current = style[key];
			if (current == null) continue;
			switch (key){
				case 'fillColor': ctx.fillStyle = this.getColor(current); break;
				case 'strokeColor': ctx.strokeStyle = this.getColor(current); break;
				case 'strokeWidth': ctx.lineWidth = Number(current); break;
				case 'strokeCap': ctx.lineCap = current; break;
				case 'strokeJoin': ctx.lineJoin = current; break;
				case 'shadowColor': console.log('shadowColor', this.getColor(current)); ctx.shadowColor = this.getColor(current); break;
				case 'shadowBlur': console.log('shadowBlur', Number(current)); ctx.shadowBlur = Number(current); break;
				case 'shadowOffsetX': console.log('shadowOffsetX', Number(current)); ctx.shadowOffsetX = Number(current); break;
				case 'shadowOffsetY': console.log('shadowOffsetY', Number(current)); ctx.shadowOffsetY = Number(current); break;
			}
		}
		if (style.fill) this.getContext().fill();
		if (style.stroke) this.getContext().stroke();
		return this;
	},
	
	clear: function(){
		this.element.width = this.element.width;
		//if (this.context) this.context.clearRect(0, 0, this.element.width, this.element.height);
		return this;
	},
	
	/* privates */
	
	getColor: function(color){
		color = color.valueOf();
		var type = $type(color);
		if (type == 'string') return color;
		
		var gradient = this.getContext().createLinearGradient(0, this.boundsMin.y, 0, this.boundsMax.y);
		switch (type){
			case 'object': for (var pos in color) gradient.addColorStop(pos, color[pos].valueOf()); break;
			case 'array': color.each(function(col, i){
				gradient.addColorStop(i / (color.length - 1), col.valueOf());
			});
		}
		return gradient;
	}
	
});

ART.Adapter.Canvas.prepare = function(){
	var dummy = document.createElement('canvas');
	return dummy && dummy.getContext;
};

ART.registerAdapter(ART.Adapter.Canvas, 0.8);