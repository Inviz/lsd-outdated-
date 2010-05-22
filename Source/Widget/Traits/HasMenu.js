

ART.Widget.Traits.HasMenu = new Class({	
  Extends: Class.inherit(
    ART.Widget.Traits.OuterClick
  ),
  
  options: {
    menu: {
      position: 'top'
    }
  },
  
  events: {
    outer: {
      element: {
        outerClick: 'collapse'
      }
    },
    menu: {
      self: {
        redraw: 'repositionMenu',
        focus: 'repositionMenu',
        blur: 'collapse',
        next: 'expand',
        cancel: 'collapse'
      }
    }
  },

	shortcuts: {
	  ok: 'set',
    cancel: 'cancel'
	},

	cancel: function() {
	  this.collapse();
	},

	set: function() {
	  this.collapse();
	},
  
  attach: Macro.onion(function() {
    this.addEvents(this.events.menu);
  }),
  
  detach: Macro.onion(function() {
    this.removeEvents(this.events.menu);
  }),
  
  repositionMenu: function(once) {
    if (!this.menu || this.collapsed) return;
    var top = 0;
    switch (this.options.menu.position) {
      case 'bottom': 
        top = this.getLayoutHeight() + 1;
        break;
      case 'center':
        top = - this.getLayoutHeight() / 2;
        break;
      case 'focus':
        top = - this.getSelectedOptionPosition();
        break;
      default:
    }
    this.menu.setStyle('top', top + this.offset.paint.top - (this.menu.styles.current.paddingTop || 0));
    this.menu.setStyle('left', this.offset.paint.left);
    this.menu.setStyle('width', this.getStyle('width'));
    if (!once) arguments.callee.delay(30, this, true)
  },
  
  buildMenu: function() {
    this.applyLayout('menu#menu');
    this.menu.getAnimation().hide();
  },
  
  expand: Macro.onion(function() {
    if (!this.menu) this.buildMenu();
    this.repositionMenu();
    this.menu.refresh();
    this.menu.show();
    this.attachOuterClick();
  }),
  
  collapse: Macro.onion(function() {
    this.menu.hide();
    //this.detachOuterClick();
  }),
  
  getSelectedOptionPosition: $lambda(0)
});

ART.Widget.ignoredEvents.push('menu')