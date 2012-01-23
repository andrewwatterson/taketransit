function createLookup(agency,route,direction,stop) {
	showSpinner();
	var lookup = $("<div class='lookupPane'>\
						<div class='lookupMap'></div>\
						<div class='lookupInfo'>\
							<div class='lookupRoute'>\
								<div class='lookupCardinal'></div>\
								<div class='lookupLabel'></div>\
							</div>\
							<div class='lookupDir'></div>\
							<div class='lookupStop'></div>\
							<ul class='lookupTimes'></ul>\
					</div>");
	lookup.css('height',window.innerHeight - 75);
	$('.lookupCardinal',lookup).text(route);
	
	// start async requests
	lookupTimes(agency,route,direction,stop,populateLookup);
	
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('SELECT * FROM routes WHERE route=?',[route], createLookupPopulatorLabel, errorHandler);
			transaction.executeSql('SELECT * FROM directions WHERE direction=?',[direction], createLookupPopulatorDir, errorHandler);
			transaction.executeSql('SELECT * FROM stops WHERE stop=?',[stop], createLookupPopulatorStop, errorHandler);
		}, errorHandler, function() { createLookupFinisher(agency,route,direction,stop); }
	);
	
	// wire it up
	$('.lookupRoute',lookup).click(function() { slider.routesPane != null ? slider.slideTo(slider.routesPane) : slider.slideTo(slider.summaryPane); });
	$('.lookupDir',lookup).click(function() { slider.schedulePane != null ? slider.slideTo(slider.schedulePane) : slider.slideTo(slider.summaryPane); });
	$('.lookupStop',lookup).click(function() { slider.schedulePane != null ? slider.slideTo(slider.schedulePane) : slider.slideTo(slider.summaryPane); });
	
	var lookupCallback = function() {
		// nothing here
		// maybe some plus button action in the future
		//$('#reloadbutton').show();
		$('#busicon').hide();
		$('#busarrow').show().click(function() { slider.slidePrev(); });
		$('#plusbutton').show().click(function() { addToSummary(agency,route,direction,stop,null); slider.slideTo(slider.summaryPane); });
	};
	
	var lookupPane = new SlidePane(lookup,lookupCallback);
	
	return lookupPane;
}

function createLookupPopulatorLabel(transaction,result) { $('.lookupLabel').append(result.rows.item(0)['label']); }
function createLookupPopulatorDir(transaction,result) { $('.lookupDir').append(result.rows.item(0)['label']); }
function createLookupPopulatorStop(transaction,result) { $('.lookupStop').append(result.rows.item(0)['label']); }

function createLookupFinisher(agency,route,direction,stop) {
	hideSpinner();
	$('#plusbutton').click(function() { addToSummary(agency,route,direction,stop); });
	slider.slideNext();
}

function populateLookup(data) {
	if(data.length == 0) { data.push("No Prediction"); }
	for(time in data) {
		var tagHeight = ($('.lookupMap').outerHeight() / 60) * data[time];
		if(!isNaN(data[time])) { data[time] += 'm'; }
		$('.lookupTimes').append("<li>"+data[time]+"</li>");
		var mapTag = $("<div class='lookupMapTag primaryRoute'><div class='arrow'></div>"+data[time]+"</div>");
		mapTag.attr('slideTo',tagHeight);
		$('.lookupMap').append(mapTag);
	}
	$('.lookupMapTag.primaryRoute').each(function() {
		var slideTo = $(this).attr('slideTo');
		$(this).animate({'top':slideTo});
	});
}