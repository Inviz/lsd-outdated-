Moo.Application = new Class({
	Extends: ART.Widget.Window,
	
  expression: "window.fancy",
  
	layout: {
	  'section#header': {
	    '#buttons': {
	      'button#minimize': {},
        'button#maximize': {},
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {
	    'scrollbar#x[mode=vertical]': {},
	    'scrollbar#y[mode=horizontal]': {}
	  },
	  'section#footer': {
			'#status[container]': {},
	    'glyph[name=drag-handle]#handle': {}
	  }
	}
});

Moo.Application.Toolbared = new Class({
	Extends: ART.Widget.Window,
	
  expression: "window.fancy",
  
	layout: {
	  'section#header': {
	    '#buttons': {
	      'button#minimize': {},
        'button#maximize': {},
        'button#close': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {}
	  },
	  'section#content[container]': {
	    'scrollbar#x[mode=vertical]': {},
	    'scrollbar#y[mode=horizontal]': {}
	  },
	  'section#footer': {
			'#status[container]': {},
	    'glyph[name=drag-handle]#handle': {}
	  }
	}
});


Moo.Notification = new Class({
  Extends: ART.Widget.Window,
  
  expression: "window.hud",
  
  layout: {
	  'section#header': {
	    '#buttons': {
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {}
	}
})