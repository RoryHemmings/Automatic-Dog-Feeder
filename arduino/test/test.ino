// /*

//     Protocol:
//         #,#
//         First number is pin number
//         Second number is 1 if on and 0 if off

// */

// #define MAX_INPUT_SIZE 4    // 4 bytes (3 characters + null termination)

// const uint8_t numPins = 5;
// const uint8_t pins[numPins] = { 11, 10, 9, 6, 5 };

// uint8_t charToInt(char n)
// {
//     return (uint8_t) (n - '0');
// }

// void getInput()
// {
//     char input[MAX_INPUT_SIZE + 1];
//     if (Serial.available() > 0) {
//         byte size = Serial.readBytes(input, MAX_INPUT_SIZE);
//         input[size] = 0;    // Null termination
//         parseCommand(input);    // Input is allocated to stack and still valid
//     }
// }

// void parseCommand(char* command) {
//     if (strlen(command) != 4) return;
//     uint8_t pin = charToInt(command[0]);
//     uint8_t on = charToInt(command[2]);

//     setLight(pin, on);
// }

// void setLight(uint8_t index, bool on) {
//     digitalWrite(pins[index], on);
// }

// void setup()
// {
//     Serial.begin(9600);

//     for (uint8_t i = 0; i < numPins; i++) {
//         pinMode(pins[i], OUTPUT);
//     }
// }

// void loop()
// {
//     getInput();
// }
