var scrollNode;
var scrollers = {};

var test;

function tabClick(evt) {
	$('.tab').removeClass('on');
	$(evt.target).addClass('on');
	$('#'+$(evt.target).attr('rel')).show();
	$('.contentArea').not('#'+$(evt.target).attr('rel')).hide();
	scrollers[$(evt.target).attr('rel')+'Scroller'].setupScroller();
}

$(function() {	
	$('.tab').click(tabClick);
	
	for(var x=0; x < 100; x++) {
		$('#nearby .scroller').append("<li>nearby "+x+"</li>");
		$('#myPlaces .scroller').append("<li>my places "+x+"</li>");
		$('#allRoutes .scroller').append("<li>all routes "+x+"</li>");
	}
		
	Array.prototype.forEach.call(document.querySelectorAll(".scroller"), function(scroller){
		scrollers[scroller.id] = new TouchScroll(scroller, {elastic: true});
	});
	
});