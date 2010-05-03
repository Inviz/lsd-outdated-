ART.Widget.Label = new Class({
  Extends: ART.Widget.Element,
  
  name: 'label',
  
  options: {
    element: {
      tag: 'label'
    }
  },
  
  events: {
    element: {
      click: 'focusRelatedWidget'
    }
  },
  
  getInput: function() {
    if (!this.input) this.input = new Element('textarea');
    return this.input;
  },
  
  focusRelatedWidget: function() {
    $(this.element).getNext().retrieve('widget').focus();
  }
})