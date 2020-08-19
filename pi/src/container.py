'''

    Protocol v1.2
    #:#&#:#&...
    servo_id:position&servo_id:position&...
    servo_id - id of servo to be moved
    position - int from 0 - 180 (angle)
    
    both numbers will be sent as character strings

'''

def generate_command(index, angle, length=5):
    command = '{index}:{angle}'.format(index=str(index), angle=str(angle))
    num_seps = length - len(command)
    command = command[:2] + (num_seps * '0') + command[2:]
    return command

class Container:
    def __init__(self, parent_board, index, MAX_ANGLE=135, MOTOR_PARALLEL_POS=180):
        self._parent_board = parent_board
        self._apparent_pos = 0  # Position as read from board
        self._index = index
        
        self._MAX_ANGLE = MAX_ANGLE
        self._MOTOR_PARALLEL_POS = MOTOR_PARALLEL_POS
        
        # Set position to starting position
        self.close()
    
    '''
        Returns absolute angle given float position from 0 to 1
    '''  
    def _pos_to_angle(self, pos):
        a = round(pos * self._MAX_ANGLE)
        return self._MOTOR_PARALLEL_POS - a
    
    '''
        Returns position (float from 0 to 1) from absolute angle
            - absolute angle is the actual angle instruction recieved from motor
              ie. 170 for 30 in relative angle
    '''
    def _angle_to_pos(self, angle):
        return ((round(((self._MOTOR_PARALLEL_POS - angle) / self._MAX_ANGLE) * 100)) / 100)
    
    def open(self):
        self.set_position(1)
    
    def close(self):
        self.set_position(0)
        
    def set_apparent_pos(self, angle):
        self._apparent_pos = self._angle_to_pos(angle)
        
    def get_apparent_pos(self):
        return self._apparent_pos
    
    def set_position(self, pos):
        self._parent_board.write_to_serial(generate_command(self._index, self._pos_to_angle(pos)))
