import argparse
parser = argparse.ArgumentParser(description='Runs Server')
parser.add_argument('-p', '--port', metavar='<port>', required=True, help='port that the server runs on', dest='port')
parser.add_argument('-n', '--hostname', metavar='<hostname>', required=True, help='hostname that the server runs on', dest='hostname')

args = vars(parser.parse_args()) # create dictionary of arguments

from flask import Flask, render_template, request, Response
app = Flask(__name__)

from multiprocessing import Process

import board
import handler
import light

import json

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route('/')
def home():
    global handler
    return render_template('home.html')

@app.route('/get-settings/')
def get_settings():
    return handler.settings.json()

@app.route('/update-settings/', methods=['POST'])
def update_settings():
    global handler
    handler.settings.update(request.json)
    return Response(status='200')

@app.route('/feed/<index>')
def feed(index):
    global handler
    index = int(index)
    if index >= 0:
        handler.feed(index)
    else:
        handler.feed_all()
        
    return Response(status='200')

@app.route('/set-container-position/')
def set_container_position():
    global handler
    handler.set_container_position(int(request.args['index']), float(request.args['position']))
    return '200'

@app.route('/get-container-position/')
def get_container_position():
    global handler
    pos = handler.get_apparent_container_position(int(request.args['index']))
    res = {'position': pos}
    res = json.dumps(res)
    return json.loads(res)

def run_server():
    app.run(port=port, host=hostname)

def run_handler():
    global handler
    handler = handler.Handler()
    handler.start()

if __name__ == '__main__':
    global port, hostname
    port = args['port']
    hostname = args['hostname']

    run_handler()
    run_server()

#py app.py -p 80 -n 192.168.1.252
