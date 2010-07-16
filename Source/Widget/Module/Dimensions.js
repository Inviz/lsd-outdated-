ART.Widget.Module.Dimensions = new Class({
	size: {},
	
	setSize: function(width, height) {
		var size = {width: width,	height: height};
		$extend(this.options, size);
		this.refresh(size);
	},
	
	setHeight: function(value, light) {
	  value = Math.max(this.styles.current.minHeight || 0, value);
		if (!light && (this.size.height == value)) return;
		this.size.height = value;
		if (!light) this.setStyle('height', value);
		return true;
	},
		
	setWidth: function(value, light) {
	  value = Math.max(this.styles.current.minWidth || 0, value);
		if (this.size.width == value) return;
		this.size.width = value;
		if (!light) this.setStyle('width', value);
		return true;
	},
	
	getClientHeight: function() {
	  var height = this.styles.current.height;
	  var auto = (height == "auto");
  	if (!height || auto) {
  	  height = this.element.offsetHeight;
  	  if (height > 0) height -= ((this.offset.padding.top || 0) + (this.offset.padding.bottom || 0))
			//height = 0;
      //var heights = [height]
      //this.getChildren().each(function(widget) {
			//  var value = widget.getOffsetHeight();
			//  var styles = widget.getStyles('float', 'clear');
			//  if (!value) return;
			//  if (styles.clear && (styles.clear != 'none')) heights = [heights[0] + (heights.length > 1 ? Math.max.apply(Math, heights.slice(1, heights.length)) : 0)]
			//  if (styles.float && (styles.float != 'auto')) {
			//    heights.push(value)
			//  } else {
			//    heights[0] += value;
			//  }
			//  console.info(widget.getSelector(), heights)
			//});  
			//height = heights[0] + (heights.length > 1 ? Math.max.apply(Math, heights.slice(1, heights.length)) : 0)
		}
		height += this.styles.current.paddingTop || 0;
		height += this.styles.current.paddingBottom || 0;
		return height;
	},
	
	getClientWidth: function() {
	  var width = this.element.scrollWidth;
	  if (width > 0) {
	    var parent = this.parentWidget;
	    if (this.styles.current.width == "auto" && this.styles.current.display != "block") width -= ((this.offset.inside.left || 0) + (this.offset.inside.right || 0)) 
	    width -= ((this.offset.paint.left || 0) + (this.offset.paint.right || 0)) 
	  }
		return width;
	},
	
	getOffsetHeight: function() {
		var height = this.getClientHeight();
		height += (this.styles.current.strokeWidth || 0) * 2
		height += this.styles.current.borderBottomWidth || 0;
		height += this.styles.current.borderTopWidth || 0;
		return height;
	},
	
	getOffsetWidth: function() {
		var width = this.getClientWidth();
		width += (this.styles.current.strokeWidth || 0) * 2
		width += this.styles.current.borderLeftWidth || 0;
		width += this.styles.current.borderBottomWidth || 0;
		return width;
	},
	
	getLayoutHeight: function() {
		var height = this.getOffsetHeight();
		height += ((this.offset.padding.top || 0) - (this.offset.inside.top || 0));
		height += ((this.offset.padding.bottom || 0) - (this.offset.inside.bottom || 0));
		return height;
	},

	getLayoutWidth: function() {
		var width = this.getOffsetWidth();
		width += ((this.offset.inside.left || 0) + (this.styles.current.marginLeft || 0));
		width += ((this.offset.inside.right || 0) + (this.styles.current.marginRight || 0));
		return width;
	}
	
})