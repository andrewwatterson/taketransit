// global variables
var slider,munidb;

$(function() {
	// init the UI
	
	slider = new SlideController();
	
	// open the database
	munidb = openMuniDB();
	
	if(location.hash == '#clearall') {
		// if we're supposed to, clear the db
		clearDB(munidb);
	} else {
		// make sure we've got data, callbacks from this func will continue the load
		checkDB(munidb);
	}
});
