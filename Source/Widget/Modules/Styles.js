ART.Widget.Modules.Styles = new Class({
	
	styles: {
		current: {},    //styles that widget currently has
		last: {},       //styles that were rendered last frame
		found: {},      //styles that were found in stylesheets
		given: {},      //styles that were manually assigned
		
		calculated: {}, //styles that are calculated in runtime
		
		element: {},    //styles that are currently assigned to element
		paint: {},      //styles that are currently used to paint
	},
	
  setStyles: function(style, temp) {
		for (var key in style) this.setStyle(key, style[key], temp)
  },
	
	setStyle: function(property, value, type) {
		if ($equals(this.styles.current[property], value)) return;
		this.styles.current[property] = value;
		switch (type) {
			case undefined:
				this.styles.given[property] = value;
				break;
			case "calculated": 
			case "given": 
				this.styles[type][property] = value;
				break;
		} 
		
	  return true;
	},
	
	getStyle: function(property) {
		var value = this.styles.current[property];
		if (value == "inherit") value = this.inheritStyle(property);
		if (value == "auto") value = this.calculateStyle(property);
		return value;
	},
	
	getStyles: function(properties) {
	  var result = {};
	  for (var i = 0, property; property = arguments[i++];) result[property] = this.getStyle(property);
	  return result;
	},

  getChangedStyles: function(property) {
    var styles = this.getStyles.apply(this, arguments);
    //var last = this.styles.last;
    //if (Hash.every(styles, function(value, key) { return $equals(last[key], value) }.bind(this))) return false;
    //$extend(this.styles.last, styles);
    return styles;
  },
	
	setElementStyle: function(property, value) {
		if (Element.Styles[property] || Element.Styles.More[property]) {
			if (this.styles.element[property] !== value) this.element.setStyle(property, value);
			this.styles.element[property] = value;
			return true;
		}	
		return false;
	},
	
	resetElementStyle: function(property) {
		this.element.setStyle(property, '');
		delete this.styles.element[property]
		return true;
	},

	inheritStyle: function(property) {
		var node = this;
		var style = node.styles.current[property];
		while ((style == 'inherit' || !style) && node.parentWidget) {
			node = node.parentWidget;
			style = node.styles.current[property];
		}
		return style;
	},
	
	calculateStyle: function(property) {
		if (this.styles.calculated[property]) return this.styles.calculated[property];
		var value;
		switch (property) {
			case "height":
				value = this.getClientHeight();
				break;
			case "width":
				value = this.inheritStyle(property);
				var el = this.element;
				//while (el = el.getParent()) console.log(el)
				if (value == "auto") value = this.getClientWidth();
				//if scrollWidth value is zero, then the widget is not in DOM yet
				//so we wait until the root widget is injected, and then try to repeat
				if (value == 0) {
				  var redraw = function() {
				    this.removeEvent('redraw', redraw)
				    this.update(true);
				  }.bind(this);
				  this.onDOMInject(redraw);
				}
		}
		this.styles.calculated[property] = value;
		return value;
	}
})