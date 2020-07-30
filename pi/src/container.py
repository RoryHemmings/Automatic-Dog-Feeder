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
    def __init__(self, parent_board, index):
        self._parent_board = parent_board
        self._angle = 0
        self._index = index
    
    def open_container(self):
        pass
    
    def set_position(self, pos):
        self._angle = round(180 * pos)
        self._parent_board.write_to_serial(generate_command(self._index, self._angle))
