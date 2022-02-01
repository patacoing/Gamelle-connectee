#include <Wire.h>
#include <I2C_LCD.h>
#include "LibString.h"
I2C_LCD LCD;
uint8_t I2C_LCD_ADDRESS = 0x51; //Device address configuration, the default value is 0x51.

//For detials of the function useage, please refer to "I2C_LCD User Manual". 
//You can download the "I2C_LCD User Manual" from I2C_LCD WIKI page: http://www.seeedstudio.com/wiki/I2C_LCD



void setup(void)
{
    Wire.begin();         //I2C controller initialization.
    LCD.CleanAll(WHITE);
    delay(1000);
    changerTaillePolice(Font_12x24,WHITE_BAC);
    afficherString("oyoyoyoyo",10,10);
}

void loop(void)
{
}
