import serial
import time
import keyboard

import threading

import light
import container

from colorama import Fore
from colorama import Style

def readLine(ser):
    try:
        return ser.readline().decode('utf-8').rstrip()
    except UnicodeDecodeError:
        return '\n' + str(ser.readline()) + '\n'
    # .rstrip()

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
        
    def feed(self):
        pass

    def set_container_position(self, index, pos):
        self._containers[index].set_position(pos)

    def write_to_serial(self, message):
        message = str(message).encode('utf-8')
        self.ser.write(message)

    def read_from_serial(self):
        line = ''
        if self.ser.in_waiting > 0:
            line = readLine(self.ser) 
        
        if len(line) > 0:
            print(line)

    def run(self):
        while self._running:
            self.read_from_serial()
            
            if keyboard.is_pressed('f'):
                return
            