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
	    'input#whatever[name=whatever][type=text]': {},
	    'textarea#soever[name=soever]': {},
	    'slider#count': {}
	  },
	  'section#footer': {
			'#status[container]': {}
	  }
	}
});

Moo.Application.Toolbared = new Class({
	Extends: ART.Widget.Window,
	
  expression: "window.fancy",
  
	layout: {
	  'section#header': {
      'button#toggler': {},
	    '#buttons': {
	      'button#minimize': {},
        'button#maximize': {},
        'button#close': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {
  	    'button#back': {},
  	    'button#forward:disabled': {},
  	    'button#search': {},
  	    'button#search': {},
  	    'button#wrench': {},
  	    'button#reload': {}
  	  }
	  },
	  'section#content[container][scrollable]': {},
	  'section#footer.flexible': {
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