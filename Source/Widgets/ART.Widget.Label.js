ART.Widget.Label = new Class({
  Extends: ART.Widget.Element,
  
  name: 'label',
  
  options: {
    element: {
      tag: 'label'
    }
  },
  
  getInput: function() {
    if (!this.input) this.input = new Element('textarea');
    return this.input;
  }
})