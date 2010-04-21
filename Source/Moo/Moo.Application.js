Moo.Application = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window//,
	  //ART.Widget.Traits.Draggable
	),
	
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
      'label#for-whatever[for=minimize]': 'Whatever:',
	    'input#whatever[name=whatever][type=text]': {},
	    'textarea#soever[name=soever]': {},
	    'slider#count': {},
	  },
	  'section#footer': {
			'#status[container]': {}
	  }
	}
});

Moo.Application.Toolbared = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window,
	  ART.Widget.Traits.Draggable,
	  ART.Widget.Traits.Resizable,
	  ART.Widget.Traits.ResizableContainer,
	  ART.Widget.Traits.Fitting,
	  Widget.Stateful({
	    'minified': ['minify', 'enlarge', 'mutate']
	  })
	),
	
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
	},
	
	events: {
	  header: {
	    toggler: {
	      element: {
	        click: 'mutate'
	      }
	    }
	  }
	}
});


Moo.Notification = new Class({
  Extends: Class.inherit(
    ART.Widget.Window
	),
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