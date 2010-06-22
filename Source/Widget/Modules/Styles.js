(function() {
	var properties = [
		'glyphColor', 'glyphShadow', 'glyphSize', 'glyphStroke', 'glyph', 'glyphColor', 'glyphColor', 'glyphHeight', 'glyphWidth', 'glyphTop', 'glyphLeft', 		
		'cornerRadius', 'cornerRadiusTopLeft', 'cornerRadiusBottomLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight',		
		'reflectionColor',  'backgroundColor', 'strokeColor', 'fillColor',
		'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'
	];
	//properties = properties.concat(Hash.getKeys(ART.Adapter.prototype.style).map(function(e) { return e.camelCase() }));
	
	ART.Styles = {};
	ART.Styles.Paint = {};
	properties.each(function(prop) {
		ART.Styles[prop] = true;
	});
	
	ART.Styles.Defaults = {
	  shadowBlur: 0,
	  shadowOffsetX: 0,
	  shadowOffsetY: 0,
	  strokeWidth: 0
	};
	
	ART.ComplexStyles = {
		'cornerRadius': {
			set: ['cornerRadiusTopLeft', 'cornerRadiusBottomLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight'],
			get: ['cornerRadiusTopLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight', 'cornerRadiusBottomLeft']
		}
	}
})();


ART.Widget.Modules.Styles = new Class({
	
	styles: {
		current: {},    //styles that widget currently has
		last: {},       //styles that were rendered last frame
		found: {},      //styles that were found in stylesheets
		given: {},      //styles that were manually assigned
		
		calculated: {}, //styles that are calculated in runtime
		computed: {},   //styles that are already getStyled
		implied: {},    //styles that are assigned by environment
		
		element: {},    //styles that are currently assigned to element
		paint: {},      //styles that are currently used to paint
	},
	
	findStyles: function() {
		var found = this.lookupStyles();
		if (found) {
			for (var property in found.styles) if (property in this.styles.given) delete found.styles[property];
			this.styles.found = found.styles;
			this.setStyles(found.styles, true);
			
			for (var property in found.implied) if (property in this.styles.given) delete found.implied[property];
			this.styles.implied = found.implied;
			$extend(this.styles.current, this.styles.implied);
		}
	},

	lookupStyles: function(selector) {
		if (!selector) selector = this.getSelector();
    if (this.selector != selector) {
			this.selector = selector;
			var result = ART.Sheet.lookup(selector);
			if (!$equals(result.rules, this.rules)) {
				this.rules = result.rules;
				for (var i in result.styles) return result;
			}
		}
		return false;
	},
	
	renderStyles: function(style) {
		$extend(this.styles.given, style);
		this.setStyles(this.styles.given)
		for (var property in this.styles.element)	{
			if (!(property in this.styles.given) && !(property in this.styles.found) && !(property in this.styles.calculated) && !(property in this.styles.implied)) {
				this.resetElementStyle(property);
			}
	  }
		for (var property in this.styles.current)	{
			if (!(property in this.styles.given) && !(property in this.styles.found) && !(property in this.styles.calculated) && !(property in this.styles.implied)) {
				delete this.styles.current[property];
  			delete this.styles.paint[property];
			}
	  }
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
	  if (this.styles.computed[property]) return this.styles.computed[property];
		var value = this.styles.current[property];
		if (value == "inherit") value = this.inheritStyle(property);
		if (value == "auto") value = this.calculateStyle(property);
		this.styles.computed[property] = value;
		return value;
	},
	
	getStyles: function(properties) {
	  var result = {};
	  for (var i = 0, property, args = arguments; property = args[i++];) result[property] = this.getStyle(property);
	  return result;
	},

  getChangedStyles: function() {
    var styles = this.getStyles.apply(this, arguments);
    var hash = $A(arguments).join('')  
    var last = $extend({}, this.styles.last[hash]);
    if (this.size.height) {
      var size = $merge(this.size);
      if (this.styles.current.height != 'auto') size.height += (this.styles.current.paddingTop || 0) + (this.styles.current.paddingBottom || 0)
      $extend(styles, size);
      //return styles;
    }
    
    var changed = false;
    for (var property in styles) {
      var value = styles[property];
      if (!$equals(last[property], value)) {
        changed = true;
        break;
      }
      delete last[property];
    };
    if (!changed) for (var property in last) {
      changed = true;
      break;
    }
    this.styles.last[hash] = styles;    
    return changed ? styles : false;
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
				if (value == 0) this.postpone()
				break;
			case "width":
				value = this.inheritStyle(property);
				if (value == "auto") value = this.getClientWidth();
				//if scrollWidth value is zero, then the widget is not in DOM yet
				//so we wait until the root widget is injected, and then try to repeat
				if (value == 0 || (this.redraws == 0)) this.postpone()
		}
		this.styles.calculated[property] = value;
		return value;
	},
	
	postpone: function() {
	  if (!this.halt('postponed')) return;
	  this.postponed = true;
		return true;
	}
});