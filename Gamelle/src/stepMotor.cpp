#include <Arduino.h>
#include <stepMotor.h>
const int dirPin = 9;
const int stepPin = 10;
const int DemiRevolution = 100;
const int enable = 8;
void moveStepper()
{

    digitalWrite(enable, HIGH);
    digitalWrite(dirPin, LOW);
    for (int x = 0; x < DemiRevolution; x++)
    {
        digitalWrite(stepPin, HIGH);
        delayMicroseconds(3000);
        digitalWrite(stepPin, LOW);
        delayMicroseconds(3000);
    }

    digitalWrite(enable, LOW);
}