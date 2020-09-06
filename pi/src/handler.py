import threading
import json
import time
import datetime
import keyboard

import board

class Settings:
    def __init__(self, path):
        self._json = {}
        with open(path) as f:
            self._json = json.load(f)
        
        self._path = path
        self._set_shortcuts()
        
    def _set_shortcuts(self):
        self.feeding_time = self._json['feeding_time']
        self.auto_feed = self._json['auto_feed']
        self.containers = self._json['containers']
        
    def json(self):
        return self._json
    
    def update(self, settings):
        self._json = settings
        with open(self._path, 'w') as f:
            json.dump(settings, f)
        
        self._set_shortcuts()

class Handler(threading.Thread):
    def __init__(self, debug_mode=False):
        threading.Thread.__init__(self)
        
        self.settings = Settings('adfsettings.json')
        
        self._board = board.Board('COM7', 9600, timeout=5, num_motors=3, debug_mode=False)
        self._board.start()
        
        self._running = True
        
        self._refresh_rate = 1 if debug_mode else 5
        self._has_fed_this_cycle = False

    def feed(self, index):
        return self._board.feed(self.settings.containers[index], index)
        
    def feed_all(self):
        return self._board.feed_all(self.settings.containers)
    
    def set_container_position(self, index, pos):
        self._board.set_container_position(index, pos)
        
    def get_apparent_container_position(self, index):
        return self._board.get_apparent_container_position(index)
        
    def run(self):
        while self._running:     
            if keyboard.is_pressed('f'):
                self.stop()
                
            n = datetime.datetime.now()
            if self.settings.feeding_time == n.strftime('%I:%M%p') and not self.settings.auto_feed:
                if not self._has_fed_this_cycle:
                    self.feed_all()
                    self._has_fed_this_cycle = True
            else:
                self._has_fed_this_cycle = False
                
            time.sleep(self._refresh_rate)
    
    def stop(self):
        self._running = False
        self._board.stop()
        
        print('Stopping')
