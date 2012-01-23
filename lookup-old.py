#!/usr/local/bin/python

print "Content-type: text/json"
print

import cgi, urllib, re, simplejson as json

urlvars = cgi.FieldStorage()
result = ''

agency = urlvars['a'].value
route = urlvars['r'].value
direction = urlvars['d'].value
stop = urlvars['s'].value

if agency == 'sf-muni':

	params = urllib.urlencode({'a': agency, 'r': route, 'd': direction, 's': stop})

	url_res = urllib.urlopen("http://www.nextmuni.com/wireless/miniPrediction.shtml?%s" % params)
	url_text = url_res.read()

	re_times = re.compile("<td valign=\"baseline\" align=\"right\">[\s]*<span style=\"font-size: [0-9]+px; font-weight: bold;\">&nbsp;([0-9]+)</span>[\s]*</td>",re.I | re.S | re.M)

	result = re_times.findall(url_text)

#id = params = urllib.urlencode({'a': agency, 'r': route, 'd': direction, 's': stop})
#result.insert(0,id);

print json.dumps(result)
