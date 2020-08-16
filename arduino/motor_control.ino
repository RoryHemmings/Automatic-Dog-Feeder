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

const uint8_t numMotors = 2;
const uint8_t motorPins[numMotors] = { 11, 9 };

// Servo motors[numMotors];

class Container;

Container *containers[numMotors];

class Container
{
public:
    Container(uint8_t index, int interval, uint8_t increment, uint8_t init_pos)
        : index(index)
        , updateInterval(interval)
        , increment(increment)
        , target(init_pos)
        , pos(init_pos - 1)     // Initiates a move to init_pos
        { }

    void SetTarget(uint8_t t)
    {
        target = t;
    }

    void Attach()
    {
        servo.attach(motorPins[index], 1000, 2000);
    }

    void Detach()
    {
        servo.detach();
    }

    void Update()
    {   
        if (pos != target) {
            if ((millis() - lastUpdate) > updateInterval) {
                lastUpdate = millis();
                pos += (pos < target) ? increment : -increment;
                servo.write(pos);
                Serial.print('p');
                Serial.print(index);
                Serial.print(':');
                Serial.println(pos);
            }
        }
    }

private:
    uint8_t index;

    Servo servo;
    uint8_t pos;
    uint8_t target;

    uint8_t increment;
    int updateInterval;
    unsigned long lastUpdate;
};

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

void parseCommand(char* command)
{
    char* seperator = strchr(command, ':'); // Find seperator character

    if (seperator != NULL) {    // Check that command contains seperator character
        *seperator = NULL;     // Set seperator character to null to create terminaton
        int index = atoi(command);
        ++seperator;            // Move the seperator to the first character of the angle portion
        int angle = atoi(seperator);  
        setMotor(index, angle);
    }
}

void setMotor(uint8_t index, uint8_t angle)
{
    containers[index]->SetTarget(angle);
    // Serial.print("IA: ");
    // Serial.print(index);
    // Serial.print(" ");
    // Serial.println(angle);
    // motors[index].write(angle);
    // delay(5);
}

void setup()
{
    Serial.begin(9600);

    for (uint8_t i = 0; i < numMotors; i++) {
        containers[i] = new Container(i, 10, 1, 180);
        containers[i]->Attach();
    }

    // for (uint8_t i = 0; i < numMotors; i++) {
    //     motors[i].attach(motorPins[i], 1000, 2000);
    // }
}

void loop()
{
    getInput();

    for (uint8_t i = 0; i < numMotors; i++) {
        containers[i]->Update();
    }
}
