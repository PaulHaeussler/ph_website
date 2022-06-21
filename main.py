import random
import string
import time
import uuid
import argparse
import json
import logging
import os
import copy

from loguru import logger
from flask import Flask, jsonify, request, render_template, make_response, url_for, send_from_directory
from os.path import dirname, abspath



from werkzeug.utils import redirect

from db import MySQLPool

stage = os.environ["STAGE"]

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
logger.add("latest.log")

def read_args():
    parser = argparse.ArgumentParser(
        description='Personal Website of Paul Häussler')
    parser.add_argument('dbhost')
    parser.add_argument('dbschema')
    parser.add_argument('dbuser')
    parser.add_argument('dbpw')
    args = vars(parser.parse_args())
    return args



logger.info("Starting up...")


args = read_args()
db = MySQLPool(host=args['dbhost'], user=args['dbuser'], password=args['dbpw'], database=args['dbschema'],
               pool_size=15)




def log(self, req):
    ip = ""
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        ip = (request.environ['REMOTE_ADDR'])
    else:
        ip = (request.environ['HTTP_X_FORWARDED_FOR'])  # if behind a proxy
    logger.info(ip + " " + req.environ.get('REQUEST_URI'))
    db.execute("INSERT INTO hits(ip, timestamp, url, sec_ch_ua, sec_ch_ua_mobile, sec_ch_ua_platform, "
                    "user_agent, accept_language, path, query) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
                    (ip, int(time.time()), req.environ.get('REQUEST_URI'), req.environ.get('HTTP_SEC_CH_UA'),
                     req.environ.get('HTTP_SEC_CH_UA_MOBILE'), req.environ.get('HTTP_SEC_CH_UA_PLATFORM'),
                     req.environ.get('HTTP_USER_AGENT'), req.environ.get('HTTP_ACCEPT_LANGUAGE'),
                     req.environ.get('PATH_INFO'), req.environ.get('QUERY_STRING')), commit=True)




app = Flask(__name__)


@app.route('/', methods = ['GET', 'POST'])
def index():
    log(request)
    pass




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
