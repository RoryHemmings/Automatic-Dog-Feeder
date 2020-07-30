/*

    Protocol v1.2
        #:#&#:#&...
        servo_id:position&servo_id:position&...
        servo_id - id of servo to be moved
        position - int from 0 - 180 (angle)
        
        both numbers will be sent as character strings

*/

#include <Servo.h>

#define INPUT_SIZE 5

const uint8_t numMotors = 3;
const uint8_t motorPins[numMotors] = { 11, 10, 9 };
// const uint8_t motorPins[numMotors] = { 11, 10, 9, 6, 5, 3 };

Servo motors[numMotors];

uint8_t charToInt(char n)
{
    return (uint8_t) (n - '0');
}

void getInput()
{
    char input[INPUT_SIZE + 1];
    if (Serial.available() > 0) {
        byte size = Serial.readBytes(input, INPUT_SIZE);
        input[size] = 0;    // Null termination
        parseCommand(input);    // Input is allocated to stack and still valid
    }
}

void parseCommand(char* command) {
    char* seperator = strchr(command, ':'); // Find seperator character

    if (seperator != NULL) {    // Check that command contains seperator character
        *seperator = NULL;     // Set seperator character to null to create terminaton
        int index = atoi(command);
        ++seperator;            // Move the seperator to the first character of the angle portion
        int angle = atoi(seperator);  
        setMotor(index, angle);
    }
}

void setMotor(uint8_t index, uint8_t angle) {
    motors[index].write(angle);
}

void setup()
{
    Serial.begin(9600);

    for (uint8_t i = 0; i < numMotors; i++) {
        motors[i].attach(motorPins[i], 1000, 2000);
    }
}

void loop()
{   
    getInput();
}
