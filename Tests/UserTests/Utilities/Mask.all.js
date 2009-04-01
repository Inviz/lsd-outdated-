{
	tests: [
		{
			title: "Mask:element",
			description: "Masks a dom element.",
			verify: "Did the dom element grey out?",
			before: function(){
				$('test').mask();
			}
		},
		{
			title: "Mask:document",
			description: "Masks the whole window.",
			verify: "Did the window grey out? If you scroll is it still grey?",
			before: function(){
				$('test').unmask();
				document.body.mask();
			}
		}
	]
}