ART.Widget.Window.extend(Traits)
ART.Widget.Window.Traited = new Class({
	Extends: ART.Widget.Window,

	//Inherits: ART.Widget.Window.Traits.Draggable,

	options: {
		header: null,
		content: null,
		footer: null
	},

	initialize: function(options) {
		this.parent(options)
		if (this.options.header) this.header.setContent(this.options.header)
		if (this.options.content) this.content.setContent(this.options.content)
		if (this.options.footer) this.footer.setContent(this.options.footer)
	},

	setContent: function(){
		this.content.setContent.apply(this.content, arguments);
		return this;
	}
})