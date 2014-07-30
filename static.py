#!/usr/bin/env python

import json
from mimetypes import guess_type

from flask import abort, Markup

import app_config
import copytext
import envoy
from flask import Blueprint
from render_utils import flatten_app_config

from smartypants import smartypants

static = Blueprint('static', __name__)

# Render JST templates on-demand
@static.route('/js/templates.js')
def _templates_js():
    r = envoy.run('node_modules/universal-jst/bin/jst.js --template underscore jst')

    return r.std_out, 200, { 'Content-Type': 'application/javascript' }

# Render LESS files on-demand
@static.route('/less/<string:filename>')
def _less(filename):
    try:
        with open('less/%s' % filename) as f:
            less = f.read()
    except IOError:
        abort(404)

    r = envoy.run('node_modules/less/bin/lessc -', data=less)

    return r.std_out, 200, { 'Content-Type': 'text/css' }

# Render application configuration
@static.route('/js/app_config.js')
def _app_config_js():
    config = flatten_app_config()
    js = 'window.APP_CONFIG = ' + json.dumps(config)

    return js, 200, { 'Content-Type': 'application/javascript' }

# Render copytext
@static.route('/js/copy.js')
def _copy_js():
    copy = copytext.Copy(app_config.COPY_PATH).json()
    copy = json.loads(copy)

    def convert_entities(obj):
        for key in obj.iterkeys():
            if isinstance(obj[key], unicode):
                obj[key] = obj[key].encode('ascii', 'xmlcharrefreplace')
            else:
                convert_entities(obj[key])

    convert_entities(copy)

    copy_json = 'window.COPY = ' + json.dumps(copy)

    return copy_json, 200, { 'Content-Type': 'application/javascript' }

# Server arbitrary static files on-demand
@static.route('/<path:path>')
def _static(path):
    try:
        with open('www/%s' % path) as f:
            return f.read(), 200, { 'Content-Type': guess_type(path)[0] }
    except IOError:
        abort(404)
