
Moo.Application = new Class({
	Includes: [
    ART.Widget.Window//,
	  //ART.Widget.Trait.Draggable
	],
	
  expression: "window.fancy",
  
	layout: {
	  'section#header': {
	    '#buttons[shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {
      'label#for-whatever[for=minimize]': 'Whatever:',
	    'input#whatever[name=whatever]': {},
	    'textarea#soever[name=soever]': {},
	    'input[type=range]#count': {},
	  },
	  'section#footer': {
			'#status[container]': {}
	  }
	}
	
});




Moo.Notification = new Class({
  Includes: [
    ART.Widget.Window
	],
  expression: "window.hud",
  
  layout: {
	  'section#header': {
	    '#buttons[shy]': {
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {}
	}
})