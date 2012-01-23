#!/usr/local/bin/python

print "Content-type: text/json"
print

import os, urllib

path = os.environ['QUERY_STRING'].split('=',1)[1];

url_res = urllib.urlopen("http://apimuni.appspot.com/" + path)
print url_res.read()