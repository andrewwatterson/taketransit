#!/usr/local/bin/python

print "Content-type: text/json"
print

#import cgi, urllib, re, simplejson as json
import cgi, urllib, re, json
from xml.dom import minidom

def getChildrenByTagName(node,tagName):
	for child in node.childNodes:
		if child.nodeType==child.ELEMENT_NODE and (tagName=='*' or child.tagName==tagName):
			yield child

agency = {'routes':{},'schedules':{},'qSchedules':{},'stops':{}}

agency_res = urllib.urlopen("http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni")
agency_text = agency_res.read()
agency_dom = minidom.parseString(agency_text)
routes = agency_dom.getElementsByTagName("route")

for routeObj in routes:
	routeId = routeObj.attributes['tag'].value
	print 'reading route ' + routeId
	
	# BUILD ROUTES HERE
	agency['routes'][routeId] = {'label':routeObj.attributes['title'].value}

	# INIT SCHEDULES
	agency['schedules'][routeId] = {}
	agency['qSchedules'][routeId] = {}
	
	route_res = urllib.urlopen("http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=%s" % urllib.quote(routeId))
 	route_text = route_res.read()
	route_dom = minidom.parseString(route_text)
 	dirs = route_dom.getElementsByTagName('direction')
 	stops = getChildrenByTagName(route_dom.getElementsByTagName('route')[0],'stop')
	
	# BUILD STOPS HERE
	theseStops = dict(
		[(stopObj.attributes['stopId'].value,
			dict({'name': stopObj.attributes['title'].value,
						'lat': stopObj.attributes['lat'].value,
						'long': stopObj.attributes['lon'].value}))
			for stopObj in stops]
	)
	agency['stops'].update(theseStops)
	
	for dirObj in dirs:
		dirId = dirObj.attributes['tag'].value
		sched = dirObj.getElementsByTagName('stop')
			
		# BUILD SCHEDULES HERE
		agency['schedules'][routeId][dirId] = {'label':dirObj.attributes['title'].value,'stops':['1' + schedObj.attributes['tag'].value for schedObj in sched]}
	
		# BUILD QUICKSCHEDULES HERE
		#agency['qSchedules'][routeId][dirId] = {'label':dirObj.attributes['title'].value,'stops':theseStops}
		
print json.dumps(agency)
