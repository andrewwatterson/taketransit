function checkDB(db) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('SELECT * FROM `agencies`;',[],checkDBHandler,checkDBErrorHandler);
		}
	);
}

function checkDBHandler(transaction,results) {
	var outOfDateFlag = true;
	
	for(var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		if(config['agencies'][row.agency]['lastUpdated'] == row.updated) { outOfDateFlag = false; }
	}
	
	if(outOfDateFlag) {
		doSetupScreen();
	} else {
		doHomeScreen();
	}
}

function checkDBErrorHandler(transaction,error) {
	console.log(error.message);
	if(error.message.search('no such table') != -1) {
		doSetupScreen();
	} else {
		doErrorScreen();
	}
}

function createTables(db) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('CREATE TABLE agencies(agency TEXT NOT NULL, label TEXT NOT NULL, updated INTEGER NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE sets(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE favorites(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `set` INTEGER NOT NULL, agency TEXT NOT NULL, route TEXT NOT NULL, direction TEXT NOT NULL, start TEXT NOT NULL, end TEXT, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			//transaction.executeSql('CREATE TABLE quickRoutes(agency TEXT NOT NULL, data TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE routes(agency TEXT NOT NULL, route TEXT NOT NULL, label TEXT NOT NULL, `order` INTEGER);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE stops(agency TEXT NOT NULL, stop TEXT NOT NULL, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE directions(agency TEXT NOT NULL, route TEXT NOT NULL, direction TEXT NOT NULL, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE schedules(agency TEXT NOT NULL, route TEXT NOT NULL, direction TEXT NOT NULL, `order` INTEGER, stop TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE INDEX routesAgency ON routes (agency);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE INDEX stopsStop ON stops (stop);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE INDEX directionsARoute ON directions (agency,route);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE INDEX schedulesARoute ON schedules (agency,route);', [], nullDataHandler, errorHandler);
		}
	);
}

function addToSummary(agency,route,direction,stop,destination) {
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('INSERT INTO favorites (agency,route,direction,start,end,`set`,label) VALUES (?,?,?,?,?,1,\'\');',[agency,route,direction,stop,destination],addToSummaryHandler,errorHandler);
		}
	);
}

function addToSummaryHandler() {
	
}

/*function populateQuickRoutes(db,agency,data,callback) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('INSERT INTO quickRoutes (agency,data) VALUES (?,?);',[],callback,errorHandler);
		},errorHandler
	);
}*/

// expects the "routes" object only, not the entire agency feed
function populateRoutes(db,agency,data,callback) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('DELETE FROM routes WHERE agency = ?;',[agency],nullDataHandler,errorHandler);
			var i = 1;
			for(route in data) {
				transaction.executeSql('INSERT INTO routes (agency,route,label,`order`) VALUES (?,?,?,?);',[agency,route,data[route]['label'],i],callback,errorHandler);
				i++;
			}
		},errorHandler
	);
}

// Builds BOTH directions and schedules
// expects the "schedules" object only, not the entire agency feed
function populateSchedules(db,agency,data,callback) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('DELETE FROM directions WHERE agency = ?;',[agency],nullDataHandler,errorHandler);
			transaction.executeSql('DELETE FROM schedules WHERE agency = ?;',[agency],nullDataHandler,errorHandler);
			for(route in data) {
				for(direction in data[route]) {
					transaction.executeSql('INSERT INTO directions (agency,route,direction,label) VALUES (?,?,?,?);',[agency,route,direction,data[route][direction]['label']],callback,errorHandler);
					
					for(stop in data[route][direction]['stops']) {
						transaction.executeSql('INSERT INTO schedules (agency,route,direction,`order`,stop) VALUES (?,?,?,?,?);',[agency,route,direction,stop,data[route][direction]['stops'][stop]],callback,errorHandler);
					}
				}
			}
		},errorHandler
	);
}

// expects the "stops" object only, not the entire agency feed
function populateStops(db,agency,data,callback) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('DELETE FROM stops WHERE agency = ?;',[agency],nullDataHandler,errorHandler);
			for(stop in data) {
				transaction.executeSql('INSERT INTO stops (agency,stop,label) VALUES (?,?,?);',[agency,stop,data[stop]],callback,errorHandler);
			}
		},errorHandler
	);
}

function errorHandler(transaction,error) {
	console.log(error.code,error.message);
	return false;
}

function nullDataHandler(transaction, results) { }

function openMuniDB() {
	try {
	    if (!window.openDatabase) {
	        alert('not supported');
	    } else {
	        var shortName = 'muni';
	        var version = '1.0';
	        var displayName = 'MuniFinder';
	        var maxSize = 65536; // in bytes
	        return openDatabase(shortName, version, displayName, maxSize);
	    }
	} catch(e) {
		// if the database version is wrong
		if(e.code == e.INVALD_STATE_ERROR) {
			// we should probably do something more intelligent here
			console.log("Old database version: "+e+".",e);
	    } else {
			console.log("Unknown error: "+e+".",e);
		}
	}
}