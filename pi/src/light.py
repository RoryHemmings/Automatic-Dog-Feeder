class Light:
    def __init__(self, parent_board, index, active=False):
        self.active = active
        self.index = index
        self._parent_board = parent_board

    def toggle(self):
        self.set_active(not (self.active))

    def set_active(self, active):
        self.active = active

        instruction = str(self.index) + ',' + ('1' if active else '0')
        self._parent_board.writeToSerial(instruction)
