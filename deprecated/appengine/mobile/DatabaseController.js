function DatabaseController(dbName,title) {
	this.data = null;
	try {
        var maxSize = 1048576; // in bytes
        this.data = openDatabase(dbName, '1.0', title, maxSize);
	} catch(e) {
		// if we ever support database versioning, we should throw a special error here
		console.log("Database error: "+e+".",e);
	}
}