#!/usr/local/bin/python

print "Content-type: text/json"
print

import cgi, urllib, re, simplejson as json

agency = {'routes':{},'schedules':{},'qSchedules':{},'stops':{}}

routes_res = urllib.urlopen("http://apimuni.appspot.com/routes")
routes_text = routes_res.read()
routes = json.loads(routes_text)

for routeObj in routes:
	# BUILD ROUTES HERE
	agency['routes'][routeObj['id']] = {'label':routeObj['name']}
	
	# INIT SCHEDULES
	agency['schedules'][routeObj['id']] = {}
	agency['qSchedules'][routeObj['id']] = {}
	
	dirs_res = urllib.urlopen("http://apimuni.appspot.com/directions?route=%s" % urllib.quote(routeObj['id']))
	dirs_text = dirs_res.read()
	dirs = json.loads(dirs_text)
	for dirObj in dirs:
		sched_res = urllib.urlopen("http://apimuni.appspot.com/stops?route=%s&direction=%s" 
% (urllib.quote(routeObj['id']), urllib.quote(dirObj['id'])))
		sched_text = sched_res.read()
		sched = json.loads(sched_text)
		
		# BUILD SCHEDULES HERE
		agency['schedules'][routeObj['id']][dirObj['id']] = {'label':dirObj['name'],'stops':[schedObj['id'] for schedObj in sched]}
		
		# BUILD QUICKSCHEDULES HERE
		agency['qSchedules'][routeObj['id']][dirObj['id']] = {'label':dirObj['name'],'stops':[{schedObj['id']:schedObj['cross_streets']} for schedObj in sched]}
		
		# BUILD STOPS HERE
		theseStops = dict([(schedObj['id'],schedObj['cross_streets']) for schedObj in sched])
		agency['stops'].update(theseStops)

print json.dumps(agency)
