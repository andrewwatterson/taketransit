function createRoutesList(agency) {
	showSpinner();
	var routesList = $("<div id='routesListWrapper' class='listPane'><ul id='metroList' class='list'></ul><ul id='busList' class='list'></ul></div>");
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('SELECT * FROM `routes` WHERE agency=? ORDER BY `order`;',[agency],createRoutesListHandler,errorHandler);
		}
	);
	
	var routesCallback = function() {
		// nothing here
		// maybe some plus button action in the future
		$('#busicon').hide();
		$('#busarrow').show().click(function() { slider.slidePrev(); });
		$('#reloadbutton').hide();
		$('#plusbutton').hide();
	};
	
	var routesPane = new SlidePane(routesList,routesCallback);
	
	return routesPane;
}

// utility function to help separate/sort numeric routes from alpha routes
function numberPart(n) 		{ return n.match(/^[0-9]+/); }

function createRoutesListHandler(transaction,results) {
	var routeList = new Array();
	
	for (var i=0; i<results.rows.length; i++) {
		routeList.push(results.rows.item(i));
	}
		
	routeList.sort(function(a,b) {

		var aNum = numberPart(a.route);
		var bNum = numberPart(b.route);

		var aRank = aNum ? aNum[0] : null; 
		var bRank = bNum ? bNum[0] : null;

			if(aRank == "1") { console.log(aRank,bRank) }

		
		if(aRank === null && a.route.indexOf("OWL") !== -1) {
			return 1;
		} else if(bRank === null && b.route.indexOf("OWL") !== -1) {
			return -1;
		} else if(aRank === bRank) {
			if(a.route < b.route) { return -1; }
			else { return 1; }
		} else if (aRank == 59 || aRank == 60 || aRank == 61) {
			return 1;
		} else {
			return aRank - bRank;
		}
	});
	
	for(var i=0; i<routeList.length; i++) {	
		var row = routeList[i];
		
		var isMetro = numberPart(row.route) === null;
		
		if(isMetro) {
			var routeRow = $("<li>"+row['route']+"</li>");
		} else {
			var routeRow = $("<li>"+row['label']+"</li>");
		}
		$(routeRow).attr('agency',row['agency']);
		$(routeRow).attr('route',row['route']);
		$(routeRow).click(function(evt) { slider.add(createScheduleList($(evt.target).attr('agency'),
																				$(evt.target).attr('route')
																				));
										});
		if(isMetro && row.route.indexOf("OWL") === -1) {
			$('#routesListWrapper #metroList').append(routeRow);
		} else {
			$('#routesListWrapper #busList').append(routeRow);
		}
	}
	hideSpinner();
	slider.slideNext();
}

function createScheduleList(agency,route) {
	showSpinner();
	var scheduleList = $("<div id='scheduleWrapper' class='listPane'><div class='tabs'></div></div>");
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('SELECT *,stops.label as stopLabel,directions.label as dirLabel FROM `schedules`,`stops`,`directions` WHERE schedules.agency=? AND stops.agency=? AND directions.agency=? AND schedules.route=? AND schedules.stop = stops.stop AND schedules.direction = directions.direction ORDER BY `order`;',[agency,agency,agency,route],function(transaction,results) { createScheduleListHandler(scheduleList,transaction,results); },errorHandler);
		}
	);
	
	var scheduleCallback = function() {
		// nothing here
		// maybe some plus button action in the future
		$('#busicon').hide();
		$('#busarrow').show().click(function() { slider.slidePrev(); });
		$('#reloadbutton').hide();
		$('#plusbutton').hide();
	};
	
	var schedulePane = new SlidePane(scheduleList,scheduleCallback);
	
	return schedulePane;
}

function createScheduleListHandler(wrapper,transaction,results) {
	console.log(results);
	for (var i=0; i<results.rows.length; i++) {
		var row = results.rows.item(i);
				
		var stopRow = $("<li>"+row['stopLabel']+"</li>");
		stopRow.attr('agency',row['agency']);
		stopRow.attr('route',row['route']);
		stopRow.attr('dir',row['direction']);
		stopRow.attr('stop',row['stop']);
		stopRow.click(function(evt) { slider.add(createLookup($(evt.target).attr('agency'),
																		$(evt.target).attr('route'),
																		$(evt.target).attr('dir'),
																		$(evt.target).attr('stop'))); });
		if($('#'+row['direction'],wrapper).length == 0) {
			$(wrapper).append("<ul class='list' id='"+row['direction']+"'></ul>");
			
			var dirTab = $("<div>"+row['dirLabel']+"</div>");
			dirTab.attr('dir',row['direction']);
			dirTab.click(function(evt) {
				$('.tabs .selected',wrapper).removeClass('selected');
				$('.list',wrapper).hide();
				$('#'+$(evt.target).attr('dir')).show();
				$(evt.target).addClass('selected');
				slider.reViewport();
			});
			$('.tabs',wrapper).append(dirTab);
		}
		$('#'+row['direction'],wrapper).append(stopRow);
	}
	$('.list',wrapper).hide();
	$('.tabs div:first',wrapper).addClass('selected');
	$('#'+$('.tabs div:first',wrapper).attr('dir')).show();
	hideSpinner();
	slider.slideNext();
}