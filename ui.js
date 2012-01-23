function doHomeScreen() {
	var home = $("\
		<div class='homeWrapper'>\
			<div id='summaryWrapper'></div>\
		</div>\
	");
	
	// this doesn't get called until any async inits to the pane are finished
	var homeCallback = function() {
		$('#busicon').show();
		$('#busarrow').hide();
		$('#plusbutton').hide();
		$('#reloadbutton').unbind().show().click(updateHomeScreen);	
		populateHomeScreen();
	};
	
	var homePane = new SlidePane(home,homeCallback);
	
	slider.add(homePane);
	slider.slideNext();
}

function populateHomeScreen() {
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('SELECT favorites.*,stops.stop,stops.label as stopLabel,directions.direction,directions.label as directionLabel FROM favorites,stops,directions WHERE stops.stop = favorites.start AND directions.direction = favorites.direction',[], populateHomeScreenHandler, errorHandler);
		}
	);
}

function populateHomeScreenHandler(transaction,results) {
	$('#summaryWrapper').empty();
	
	if(results.rows.length == 0) { slider.add(createRoutesList('sf-muni')); }
	
	for (var i=0; i<results.rows.length; i++) {
		var row = results.rows.item(i);
		$('#summaryWrapper').append(createSummaryBox(row.id,row.agency,row.route,row.direction,row.start,row.directionLabel,row.stopLabel));
	}
	
	$('#summaryWrapper').append("<div id='otherroutes'>See All Routes</div>");
	$('#otherroutes').click(function(evt) { slider.add(createRoutesList('sf-muni')); });
	updateHomeScreen();
}

function doErrorScreen() {
	console.log('doing error screen');
}

function showSpinner() { $('#spinner').css('top',window.scrollY); $('#spinner').css('height',window.innerHeight); $('#spinner').show(); }

function hideSpinner() { $('#spinner').hide(); }

function createSummaryBox(id,agency,route,direction,stop,directionLabel,stopLabel) {
	var summaryBox = $("\
	<div class='summaryBox'>\
	<table><tr>\
		<td class='cardinal'></td>\
		<td class='textWrapper'>\
			<div class='summary'></div>\
			<div class='stop'></div>\
		</td>\
		<td class='deleteBtn'>Delete</td>\
		<td class='spinner'></td>\
		<td class='times'>\
			<span class='soonest'></span><br />\
		</td>\
	</tr></table>\
	</div>\
	");
	
	summaryBox.attr('id',id);
	summaryBox.attr('agency',agency);
	summaryBox.attr('route',route);
	summaryBox.attr('direction',direction);
	summaryBox.attr('stop',stop);
	
	$('.cardinal',summaryBox).append(route);
	//$('.times',summaryBox).append("<span class=\"soonest\">" + times.shift() + "m</span><br />" + times.join(", "));
	$('.summary',summaryBox).append(directionLabel);
	$('.stop',summaryBox).append(stopLabel);
	
	$('.deleteBtn',summaryBox).click(function(evt) { deleteSummaryRow($(evt.target.parentElement).attr('id')); })
	
	summaryBox.swipe({
		
	swipeRight:
		function(evt) {
		$('.deleteBtn',evt.target).animate({'width': 62},150);
		/*$(evt.target).dblclick(function(evt) {
			// reverse the swipe action
		});*/
	},
	swipeLeft: null
	});
	
	return summaryBox;
}

function updateHomeScreen() {
	$('.summaryBox').each(function() {
		updateSummaryBox(this);
	});
}

function updateSummaryBox(box) {
	$('.times',box).removeClass('unavailable');
	$('.spinner',box).css('visibility','visible');
	jQuery.getJSON('./lookup.py',{'a':$(box).attr('agency'),'r':$(box).attr('route'),'d':$(box).attr('direction'),'s':$(box).attr('stop')},function(data,textStatus) { updateSummaryBoxHandler(box,data,textStatus); });
}

function updateSummaryBoxHandler(box,data,textStatus) {
	if(data.length == 0) {
		$('.times',box).addClass('unavailable');
	} else {
		$('.times',box).empty().append("<span class=\"soonest\">" + data.shift() + "m</span><br />" + data.join(", "));
	}
	$('.spinner',box).css('visibility','hidden');
}

function deleteSummaryRow(id) {
	munidb.transaction(function(transaction) {
		transaction.executeSql('DELETE FROM favorites WHERE id = ?;',[id],function() { deleteSummaryRowHandler(id); },errorHandler);
	});
}

function deleteSummaryRowHandler(id) {
	$('.summaryBox[id='+id+']').slideUp(150,function() { $('.summaryBox[id='+id+']').remove(); });
	slider.reViewport();
}

// takes an array of objects, each with a 'cat' (category name for use in DB and code)
// and a 'title' (category name for us in UI) property.
function initTabs(tabs) {
	var tabWrapper = $("<ul></ul>");
	tabWrapper.attr('id','loc_tabs');
	for(tab in tabs) {
		var workingTab = $("<li></li>");
		workingTab.addClass(tabs[tab].cat);
		workingTab.append(tabs[tab].title);
		workingTab.css('width',100/tabs.length+'%');
		workingTab.click(
			function(evt) {
				$('#loc_tabs > li').removeClass('selected');
				$(evt.target).addClass('selected');
			});
		tabWrapper.append(workingTab);
	}
	$('#wrapper').append(tabWrapper);
}