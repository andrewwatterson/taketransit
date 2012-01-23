var loader = new AsyncLoaderManager();
//var slider = new SlideController();
//var db = new DatabaseController();

function needsUpdate() {
	return !(window.navigator.standalone);
	// or the cache is out of date
	// or the db doesn't exist
	// or the db is out of date
}

function initMobileApp() {
	console.log('initMobileApp');
	if(needsUpdate()) {
		console.log('doing update...');
		loader.add('./update/update.css');
		loader.add('./update/update.js');
		loader.loadNext(function() { console.log('calling back'); startUpdate(); });
	} else {
		initHomePage();
	}
}

function initHomePage() {

}

function loadMobileAppScripts() {
	loader.add('./lib/jq.js');
	loader.add('./lib/fixed.js');
	loader.add('./offline.js');
	loader.loadNext(initMobileApp);
}