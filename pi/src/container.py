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
    def __init__(self, parent_board, index, MAX_ANGLE=90):
        self._parent_board = parent_board
        self._angle = 0     # Angle as sent to board
        self._apparent_pos = 0  # Position as read from board
        self._index = index
        
        self._MAX_ANGLE = MAX_ANGLE
    
    def open(self):
        self.set_position(1)
    
    def close(self):
        self.set_position(0)
        
    def set_apparent_pos(self, angle):
        self._apparent_pos = (round((angle / self._MAX_ANGLE) * 100)) / 100
        
    def get_apparent_pos(self):
        return self._apparent_pos
    
    def set_position(self, pos):
        self._angle = round(self._MAX_ANGLE * pos)
        self._parent_board.write_to_serial(generate_command(self._index, self._angle))
