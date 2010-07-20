(function() {
	
	ART.Styles = new ART.Hash(
	  'glyphColor', 'glyphShadow', 'glyphSize', 'glyphStroke', 'glyph', 'glyphColor', 'glyphColor', 'glyphHeight', 'glyphWidth', 'glyphTop', 'glyphLeft', 		
		'cornerRadius', 'cornerRadiusTopLeft', 'cornerRadiusBottomLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomRight',		
		'reflectionColor',  'backgroundColor', 'strokeColor', 'fillColor',
		'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'
	)
	
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


ART.Widget.Module.Styles = new Class({
	
	style: {
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
			for (var property in found.style) if (property in this.style.given) delete found.style[property];
			this.style.found = found.style;
			this.setStyles(found.style, true);
			
			for (var property in found.implied) if (property in this.style.given) delete found.implied[property];
			this.style.implied = found.implied;
			$extend(this.style.current, this.style.implied);
		}
	},

	lookupStyles: function(selector) {
		if (!selector) selector = this.getSelector();
    if (this.selector != selector) {
			this.selector = selector;
			var result = ART.Sheet.lookup(selector);
			if (!$equals(result.rules, this.rules)) {
				this.rules = result.rules;
				for (var i in result.style) return result;
			}
		}
		return false;
	},
	
	renderStyles: function(style) {
		$extend(this.style.given, style);
		this.setStyles(this.style.given)
		for (var property in this.style.element)	{
			if (!(property in this.style.given) && !(property in this.style.found) && !(property in this.style.calculated) && !(property in this.style.implied)) {
				this.resetElementStyle(property);
			}
	  }
		for (var property in this.style.current)	{
			if (!(property in this.style.given) && !(property in this.style.found) && !(property in this.style.calculated) && !(property in this.style.implied)) {
				delete this.style.current[property];
  			delete this.style.paint[property];
			}
	  }
	},
	
  setStyles: function(style, temp) {
		for (var key in style) this.setStyle(key, style[key], temp)
  },
	
	setStyle: function(property, value, type) {
		if ($equals(this.style.current[property], value)) return;
		this.style.current[property] = value;
		switch (type) {
			case undefined:
				this.style.given[property] = value;
				break;
			case "calculated": 
			case "given": 
				this.styles[type][property] = value;
				break;
		} 
		
	  return true;
	},
	
	getStyle: function(property) {
	  if (this.style.computed[property]) return this.style.computed[property];
		var value = this.style.current[property];
		if (value == "inherit") value = this.inheritStyle(property);
		if (value == "auto") value = this.calculateStyle(property);
		if (property == 'height') value = this.getClientHeight();
		this.style.computed[property] = value;
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
    var last = $extend({}, this.style.last[hash]);
    if (this.size.height) {
      var size = $merge(this.size);
      if (this.style.current.height != 'auto') size.height += (this.style.current.paddingTop || 0) + (this.style.current.paddingBottom || 0)      
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
    this.style.last[hash] = styles;    
    return changed ? styles : false;
  },
	
	setElementStyle: function(property, value) {
		if (Element.Styles[property] || Element.Styles.More[property]) {
			if (this.style.element[property] !== value) this.element.setStyle(property, value);
			this.style.element[property] = value;
			return true;
		}	
		return false;
	},
	
	resetElementStyle: function(property) {
		this.element.setStyle(property, '');
		delete this.style.element[property]
		return true;
	},

	inheritStyle: function(property) {
		var node = this;
		var style = node.style.current[property];
		while ((style == 'inherit' || !style) && node.parentWidget) {
			node = node.parentWidget;
			style = node.style.current[property];
		}
		return style;
	},
	
	calculateStyle: function(property) {
		if (this.style.calculated[property]) return this.style.calculated[property];
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
		this.style.calculated[property] = value;
		return value;
	},
	
	postpone: function() {
	  if (!this.halt('postponed')) return;
	  this.postponed = true;
		return true;
	}
});