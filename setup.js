var globaldata;

function clearDB(db,clearPersonalData) {
	db.transaction(
		function(transaction) {
			if(clearPersonalData) {
				transaction.executeSql('DROP TABLE `sets`;',[],nullDataHandler,errorHandler);
				transaction.executeSql('DROP TABLE `favorites`;',[],nullDataHandler,errorHandler);
			}
			transaction.executeSql('DROP TABLE `agencies`;',[],nullDataHandler,errorHandler);
			transaction.executeSql('DROP TABLE `directions`;',[],nullDataHandler,errorHandler);
			transaction.executeSql('DROP TABLE `routes`;',[],nullDataHandler,errorHandler);
			transaction.executeSql('DROP TABLE `stops`;',[],nullDataHandler,errorHandler);
			transaction.executeSql('DROP TABLE `schedules`;',[],nullDataHandler,errorHandler);
		},errorHandler,clearHandler
	);
}

function clearHandler() {
	window.location.hash = '';
	window.location.reload();
}

function doSetupScreen() {
	$('#titlebar').css('top',-44);
	var setup = $("\
		<div class='setupWrapper'>\
			<h3>Welcome, San Francisco.</h3>\
			<h2>MuniFinder</h2>\
			<h3>Find bus arrival times faster.<br />\
				See all your buses at once.</h3>\
			<h4>We need to set up your iPhone with the Muni schedules.\
			If Safari asks you for permission to store things/see your \
			location, tap &quot;Allow.&quot;<br />\
			<span class='detailsLink'>Details about setup</span></h4>\
			<div id='setupButton' class='button'>Setup MuniFinder</div>\
			<div class='progBarOuter'><div class='progBarInner'></div></div>\
		</div>");
	
	$('#setupButton',setup).click(function() {
		$('#setupButton').hide();
		$('.progBarOuter').show();
		createTables(munidb);
		setupAgency('sf-muni');
	});
	
	var setupCallback = function() {
		// titlebar is hidden in this view; show nothing
	};
	
	setupPane = new SlidePane(setup,setupCallback);
	
	slider.add(setupPane);
	slider.slideNext();
}

function setupAgency(agency) {
	var progressAnimate = setInterval(function() {
		var curPos = $('.progBarInner').css('backgroundPositionX');
		curPos = curPos.substr(0,curPos.length - 2);
		if(curPos == 44) {
			$('.progBarInner').css('backgroundPositionX',1);	
		} else {
			$('.progBarInner').css('backgroundPositionX',Number(curPos)+1);
		}
	},10);
	jQuery.getJSON('./agencies/'+agency+'.js',null,function(data,textStatus) { clearInterval(progressAnimate); setupAgencyHandler(agency,data,textStatus) });
}

function setupAgencyHandler(agency,data,textStatus) {
	globaldata = data;
	$('.progBarInner').css({backgroundImage:'url(\'./img/progressSolid.png\')',backgroundRepeat:'repeat-y',backgroundPositionX:'-600'});
	
	var totalCallbacks = config['agencies'][agency]['routes'] + config['agencies'][agency]['directions'] + config['agencies'][agency]['stops'] + config['agencies'][agency]['scheduleEntries'];
	var callbacksSoFar = 0;
		
	function setupAgencyCallback() {
		callbacksSoFar++;
		if(callbacksSoFar % Math.round(totalCallbacks / 100,0) == 0) { updateSetupScreenProgress(); }
		if(callbacksSoFar == totalCallbacks) { setupAgencyFinisher(agency); }
	}
	
	populateRoutes(munidb,agency,data['routes'],setupAgencyCallback);
	//populateQuickRoutes(munidb,agency,data['routes'],setupAgencyCallback);
	populateSchedules(munidb,agency,data['schedules'],setupAgencyCallback);
	populateStops(munidb,agency,data['stops'],setupAgencyCallback);
}

function setupAgencyFinisher(agency) {
	// set the correct version in the database
	munidb.transaction(
		function(transaction) {
			transaction.executeSql('INSERT INTO agencies (agency,label,updated) VALUES (?,?,?);',[agency,config['agencies'][agency]['label'],config['agencies'][agency]['lastUpdated']],nullDataHandler,errorHandler);
		}
	);
	
	doHomeScreen();
	slider.slideNext();
	$('#titlebar').animate({top:0},200);
}

// increments the progress bar 1%
function updateSetupScreenProgress() {
	
	var curPos = $('.progBarInner').css('backgroundPositionX');
	curPos = curPos.substr(0,curPos.length - 2);
	var width = $('.progBarInner').width();
	$('.progBarInner').css('backgroundPositionX',Number(curPos) + (width / 100));
}