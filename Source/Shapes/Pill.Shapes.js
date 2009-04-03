// And some extra glyphs

ART.Paint.defineShape('horizontal-pill', function(size){
	var r = (size.y / 2);
	this.shape('rounded-rectangle', {x: size.x, y: size.y}, r);
});

ART.Paint.defineShape('vertical-pill', function(size){
	var r = (size.x / 2);
	this.shape('rounded-rectangle', {x: size.x, y: size.y}, r);
});