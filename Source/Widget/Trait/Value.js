Widget.Trait.Value = new Class({

	setValue: function(item) {
	  var value = this.value;
	  this.value = this.processValue(item);
	  if (value != this.value) {
      var result = this.applyValue(this.value);
	    this.onChange(this.value);
	    return result;
	  }
	},
	
	applyValue: function(item) {
	  return this.setContent(item)
	},

	getValue: function(item) {
	  return this.formatValue(this.value);
	},

	formatValue: $arguments(0),
	processValue: $arguments(0),
	
	onChange: function() {
	  this.fireEvent('change', arguments)
	  return true;
	}
})