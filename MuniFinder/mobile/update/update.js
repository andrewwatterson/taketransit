function startUpdate() {
	console.log('starting update...');
	if(!(window.navigator.standalone)) {
		console.log('doing install screen...');
		$('body').attr('id','installScreen');
		$('body').empty().append("\
		<h2 class='separate'>Welcome, San Francisco.</h2>\
		<h1>MuniFinder</h1>\
		<h2>Find bus arrival times faster.</h2>\
		<h2>See all your buses at once.</h2>\
		<div class='installBubble'>\
			<div class='installText'><h2>INSTALL</h2>Tap the + icon below<br />Tap &ldquo;Add to Home Screen&rdquo;</div>\
			<div class='installArrow'></div>\
		</div>\
		");
	}
	
	if(database is missing) {
		// do setup page
	}
	
	//if(database is out of date) {
	//	// do update page
	//}
	
	//if(all if well)

}