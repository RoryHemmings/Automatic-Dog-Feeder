import threading
import json

import board

class Settings:
    def __init__(self, path):
        self._json = {}
        with open(path) as f:
            self._json = json.load(f)
        
        self._path = path
        
        self.feeding_time = self._json['feeding_time']
        self.auto_feed = self._json['auto_feed']
        self.containers = self._json['containers']
        
    def json(self):
        return self._json
    
    def update(self, settings):
        self._json = settings
        with open(self._path, 'w') as f:
            json.dump(settings, f)

class Handler(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        
        self.settings = Settings('adfsettings.json')
        
        self._board = board.Board('COM7', 9600, timeout=1, num_motors=3)
        self._board.start()
        
        self._running = True

    def feed(self, index):
        return self._board.feed(self.settings.containers[index], index)
        
    def feed_all(self):
        return self._board.feed_all(self.settings.containers)
    
    def set_container_position(self, index, pos):
        self._board.set_container_position(index, pos)
        
    def get_apparent_container_position(self, index):
        return self._board.get_apparent_container_position(index)
        
    def run(self):
        pass
        # while self._running:
        #     pass
