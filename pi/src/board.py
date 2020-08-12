'''

    queue pattern: 
        [
            {index, tick_offset},    Order from lowest tick_offset to highest
            {index, tick_offset},
            {index, tick_offset},
            ...
        ]
    
'''


import serial
import time
import keyboard

import threading

import light
import container

from colorama import Fore
from colorama import Style

TPS = 100
TICK_RATE = 1 / TPS

def read_line(ser):
    try:
        return ser.readline().decode('utf-8').rstrip()
    except UnicodeDecodeError:
        return '\n' + str(ser.readline()) + '\n'

class Board(threading.Thread):
    def __init__(self, port, baud_rate, timeout, num_motors=1):
        threading.Thread.__init__(self)
        
        self.ser = serial.Serial(port, baud_rate, timeout=timeout)
        self.ser.flush()
    
        self._containers = []
        for i in range(num_motors):
            cont = container.Container(self, i)
            self._containers.append(cont)
        
        self._running = True
        self._ticks = 0
        self._command_queue = []
        
    def _gen_ti_pair(self, food_amount, food_type, index):
        time_open = 200
        a = {
            'open': True,
            'tick_offset': self._ticks,     # Should be opened off immediately
            'index': index
        }
        b = {
            'open': False,
            'tick_offset': self._ticks + time_open,     # Should be closed in time_open milliseconds
            'index': index
        }
        return (a, b)
    
    def _reset_queue(self):
        for ti in self._command_queue:
            ti['tick_offset'] -= self._ticks
            
        self._ticks = 0
        
    def _add_to_command_queue(self, ti):
        i = 0
        while i < len(self._command_queue):
            if ti['tick_offset'] < self._command_queue[i]['tick_offset']:
                self._command_queue.insert(i, ti)
                return
            i += 1
            
        self._command_queue.append(ti)
    
    # for high level control
    def feed(self, settings, index):
        # add to queue angle-time-index-pair based off settings
        commands = self._gen_ti_pair(settings['food_amount'], settings['food_type'], index)
        self._add_to_command_queue(commands[0])
        self._add_to_command_queue(commands[1])
    
    # for extra-high level control 
    def feed_all(self, settings_list):
        for i in range(len(self._containers)):
            self.feed(settings_list[i], i)

    # for low level control
    def set_container_position(self, index, pos):
        self._containers[index].set_position(pos)
        
    def get_apparent_container_position(self, index):
        return self._containers[index].get_apparent_pos()

    # for extra-low level control
    def write_to_serial(self, message):
        message = str(message).encode('utf-8')
        self.ser.write(message)

    # for extra-low level reading
    def read_from_serial(self):
        line = ''
        if self.ser.in_waiting > 0:
            line = read_line(self.ser)
        
        if len(line) > 0:
            if line[0] == 'p':
                self._containers[int(line[1])].set_apparent_pos(float(line[3:]))
            else:
                print(line)

    def run(self):
        while self._running:
            now = time.time()
            
            # input management
            self.read_from_serial()
            if keyboard.is_pressed('f'):
                self._running = False
            
            # output managment
            if (len(self._command_queue) > 0):
                head = self._command_queue[0]
                
                self._ticks += 1
                if self._ticks >= head['tick_offset']:
                    if head['open']:
                        self._containers[head['index']].open()
                    else: 
                        self._containers[head['index']].close()
                        
                    self._command_queue.pop(0)   # remove first element
                    self._reset_queue()
                
            # if the tick number gets past 10 seconds, it will auto reset to keep the tick number reasonably small
            if (self._ticks >= 10000):
                self._reset_queue()
            
            elapsed = time.time() - now
            time.sleep(TICK_RATE - (elapsed if elapsed <= TICK_RATE else 0))
    
        quit()
            