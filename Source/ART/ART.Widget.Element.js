

ART.Widget.Element = new Class({
  Extends: ART.Widget.Base,  
  setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.element) return true;
		return !this.setElementStyle(property, value);
  }
})