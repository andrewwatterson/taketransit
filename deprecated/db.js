var populatedStops = new Array(10000);

function checkDB(db) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('SELECT * FROM `agencies`;',[],checkDBHandler,checkDBErrorHandler);
		}
	);
}

function checkDBHandler(transaction,results) {
	var outOfDateFlag = false;
	
	for(var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		if(config['agencies'][row.agency]['lastUpdated'] != row.updated) { outOfDateFlag = true; }
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
			transaction.executeSql('CREATE TABLE routes(agency TEXT NOT NULL, route TEXT NOT NULL, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE stops(agency TEXT NOT NULL, stop TEXT NOT NULL, label TEXT NOT NULL);', [], nullDataHandler, errorHandler);
			transaction.executeSql('CREATE TABLE schedules(agency TEXT NOT NULL, route TEXT NOT NULL, direction TEXT NOT NULL, `order` INTEGER, stop TEXT NOT NULL);', [], nullDataHandler, errorHandler);
		}
	);
}

function fetchFavorites(db) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('SELECT * FROM favorites',[], fetchFavoritesHandler, errorHandler);
		}
	);
}

function populateRoutes(db) {
	jQuery.getJSON('./apimuni.py?path=routes','',function(data,textStatus) { populateRoutesHandler(db,data); });
}

function populateRoutesHandler(db,data) {
	db.transaction(
		function(transaction) {
			for(route in data) {
				transaction.executeSql('INSERT INTO routes (agency,route,label) VALUES (\'sf-muni\',?,?);',[data[route].id,data[route].name],nullDataHandler,errorHandler);
			}
		}
	);
}

function populateSchedules(db) {
	jQuery.getJSON('./apimuni.py?path=routes','',function(routes,textStatus) { populateSchedulesStep1Handler(db,routes); });
}

function populateSchedulesStep1Handler(db,routes) {
	for(route in routes) {
		eval("jQuery.getJSON('./apimuni.py?path=directions?route=' + routes[route].id,'',function(dirs,textStatus) { populateSchedulesStep2(db,routes["+route+"].id,dirs); });");
	}
}

function populateSchedulesStep2(db,route,dirs) {
	for(dir in dirs) {
		eval("jQuery.getJSON('./apimuni.py?path=stops?route=' + route + '&direction=' + dirs[dir].id,'',function(stops,textStatus) { populateSchedulesStep2Handler(db,route,dirs["+dir+"].id,stops); });");
	}
}

function populateSchedulesStep2Handler(db,route,dir,stops) {
	var index = 1;
	db.transaction(
		function(transaction) {
			for(stop in stops) {
				transaction.executeSql('INSERT INTO schedules (agency,route,direction,`order`,stop) VALUES (\'sf-muni\',?,?,?,?);',[route,dir,index,stops[stop].id],nullDataHandler,errorHandler);
				if(populatedStops[stops[stop].id] != 1) {
					transaction.executeSql('INSERT INTO stops (agency,stop,label) VALUES (\'sf-muni\',?,?);',[stops[stop].id,stops[stop].cross_streets],nullDataHandler,errorHandler);
					populatedStops[stops[stop].id] = 1;
				}
				index++;
			}			
		}
	);
}

function fetchFavoritesHandler(transaction,results) {
	console.log('hey');
	console.log(results);
}

function errorHandler(transaction,error) {
	console.log(error.code,error.message);
	return false;
}

function nullDataHandler(transaction, results) { }