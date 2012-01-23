#!/usr/local/bin/python

print "Content-type: text/json"
print

import cgi, urllib, re

try:
	import simplejson as json
	using_simplejson = True
except ImportError:
	using_simplejson = False
from xml.dom import minidom

urlvars = cgi.FieldStorage()
result = []

agency = urlvars['a'].value
route = urlvars['r'].value
direction = urlvars['d'].value
stop = urlvars['s'].value

# agency = 'sf-muni'
# route = 'N OWL'
# direction = 'N__OWLOB1'
# stop = 15205

if agency == 'sf-muni':

	params = urllib.urlencode({'command':'predictions', 'a': agency, 'routeTag': route, 'stopId': stop})

	predict_res = urllib.urlopen("http://webservices.nextbus.com/service/publicXMLFeed?%s" % params)
	predict_text = predict_res.read()
	predict_dom = minidom.parseString(predict_text);

	predictions = predict_dom.getElementsByTagName('prediction')

	for prediction in predictions:
		if prediction.attributes['dirTag'].value == direction:
			result.append(prediction.attributes['minutes'].value)

print json.dumps(result)
