function SlidePane(elem,wireUpFn) {
	
	this.onSlideIn = wireUpFn;
	this.domElem = $("<div class='slidePane'></div>").append(elem);
	
}