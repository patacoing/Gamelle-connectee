#include "LibCapteur.h"

#define PIN_CAPTEUR A0

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    Serial.println(getMasse());
}