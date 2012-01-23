function checkPlatform() {
	// return false if anything that doesn't degrade gracefully with modernizr isn't supported
	return window.openDatabase && window.applicationCache;
}

function AsyncLoaderManager() {
	this.queue = Array();
	this.add = function(filename,callback) {
		this.queue.push({'name':filename,'callback':callback});
	};
	this.loadNext = function(callback) {
		if(this.queue.length > 0) {
			var file = this.queue.shift();
			var self = this; // this gets around using hitch()
			//var cb = (file.callback == null ? function() { self.loadNext(); } : file.callback);
			// this ignores the per-file callback
			var cb = (this.queue.length == 0 ? callback : function() { self.loadNext(callback); });
			if(file.name.substr(file.name.lastIndexOf('.') + 1) == 'js') {
				this.loadScript(file.name,cb);
			} else if (file.name.substr(file.name.lastIndexOf('.') + 1) == 'css') {
				this.loadStyle(file.name,cb);
			}
				
		}
	};
	
	this.loadScript = function(filename,callback) {
		var theScript = document.createElement('script');
		theScript.src = filename;
		theScript.type = 'text/javascript';
		theScript.onload = callback;
		document.getElementsByTagName('head')[0].appendChild(theScript);	
	};
	this.loadStyle = function(filename,callback) {
		var theStyle = document.createElement('link');
		theStyle.href = filename;
		theStyle.type = 'text/css';
		theStyle.rel = 'stylesheet';
		document.getElementsByTagName('head')[0].appendChild(theStyle);	
		callback();
	};
}