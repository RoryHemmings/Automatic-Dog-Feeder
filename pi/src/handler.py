import threading
import json

import board

def get_settings(path):
    ret = {}
    with open(path) as f:
        ret = json.load(f)
    
    return ret

def update_settings(settings):
    pass

class Handler(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        
        self._settings = get_settings('adfsettings.json')
        
        self._board = board.Board('COM7', 9600, 1, 6)
        self._board.start()
        
        self._running = True

    def feed(self):
        print('feed')
    
    def set_container_position(self, index, pos):
        self._board.set_container_position(index, pos)
        
    def run(self):
        pass
        # while self._running:
        #     pass
