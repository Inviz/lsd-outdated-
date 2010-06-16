Moo.Application.Preferences.Network = new Class({
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
  
  options: {
    resizer: {
      modifiers: {
        y: false
      }
    }
  },
  
  expression: "window.fancy#network",
  
	events: {
	  header: {
	    toggler: {
        click: 'mutate'
	    }
	  }
	},
	
	layout: {
	  'section#header': {
      'button#toggler[shy]': {},
	    '#buttons[hoverable][shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize:disabled': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {
        'input-search[type=search]#search': {},
  	    'button#back.left': {},
  	    'button#forward.right:disabled': {},
  	    'button#index': 'Show All'
  	  }
	  },
	  'section#content[container]': {
  	  'glyph[name=drag-handle]#handle.corner[at=bottom right]': {},
	    'form.two-column#networking': {
	      '#legend': [
  	      {'label[for=location]': 'Location:'},
  	      'select#location'
  	    ],
  	    'panel#left': {
  	      'list-networks#networks[height="parent - hub - 1"]': {},
	        'toolbar[at=bottom]#hub': {
      	    'button#remove:disabled': {},
      	    'button#add': {},
      	    'button#configure': {}
	        }
  	    },
  	    //'splitter#resizer': {},
  	    'panel#right[width="parent - left - 56"]': [
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#text',
  	      {'label[for=appearance]': 'Slider:'},
    	    'slider#count',
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#text2'
  	    ],
  	    '#actions': {
    	    'button#assist': 'Assist me...',
    	    'button#revert:disabled': 'Revert',
    	    'button#apply:disabled': 'Apply'
  	    }
  	  }
	  }
	}
});

ART.Widget.List.Networks = new Class({
  Extends: ART.Widget.List,
  
  options: {
    list: {
      item: 'list-item-network'
    }
  },
  
  items: [
    {
      online: true,
      name: 'Parallels adapter'
    },
    {
      online: false,
      name: 'Ethernet'
    }
  ],
  
	buildItem: function(item) {
	  var widget = this.buildLayout(this.options.list.item);
	  widget.value = item;
	  widget.listWidget = this;
	  widget.setContent(item);
	  this.getContainer().append(widget); 
	  return widget;
	},
})

ART.Widget.List.Item.Network = new Class({
  Extends: ART.Widget.List.Item,
  
  setContent: function(item) {
    this.parent('<h2>' + item.name + '</h2>' + '<p>' + (item.online ? 'Connected' : 'Not connected') + '</p>');
  }
})
