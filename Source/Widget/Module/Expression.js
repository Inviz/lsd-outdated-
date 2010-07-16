ART.Widget.Module.Expression = new Class({
	expression: false,
	
	applyExpression: function(expression) {
	  var parsed = SubtleSlickParse(expression)[0][0];
	  if (parsed.classes) {
	    this.classes.push.apply(this.classes, parsed.classes);
	    parsed.classes.each(function(cls) {
	      this.addClass(cls)
	    }, this)
	  }
	  
	  var options = {};
	  if (parsed.id) options.id = parsed.id;
	  if (parsed.attributes) {
  		if (parsed.attributes) parsed.attributes.each(function(attribute) {
  			options[attribute.name] = attribute.value || true;
  		});
	  }  
  	if (parsed.attributes || parsed.id) $extend(this.options, options);
	  this.fireEvent('expression', [parsed, expression]);
	}
});