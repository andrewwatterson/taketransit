function lookupTimes(agency,route,direction,stop,callback) {
	var get_vars = {a:agency,r:route,d:direction,s:stop};
	jQuery.getJSON('./lookup.py?' + jQuery.param(get_vars),callback);
}

function startGlobalUpdate() {
	$('.schedule_box').each(
		function(intIndex) {
			jQuery.getJSON('./lookup.py?' + $(this).attr('id'),function(data) { updateRow(data); });
		}
	);
}

function updateRow(data) {
	id = data.shift();
	console.log(id);
	$('#'+id).empty().append(data.join(', '));
	//$('#' + id + ' .times').append(data.join(', '));
	//console.log(data);
}