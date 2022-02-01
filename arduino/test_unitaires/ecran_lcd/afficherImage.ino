#include <Wire.h>
#include <I2C_LCD.h>
#include "LibImage.h"
I2C_LCD LCD;
uint8_t I2C_LCD_ADDRESS = 0x51; //Device address configuration, the default value is 0x51.

extern GUI_Bitmap_t bmimage;


//For detials of the function useage, please refer to "I2C_LCD User Manual". 
//You can download the "I2C_LCD User Manual" from I2C_LCD WIKI page: http://www.seeedstudio.com/wiki/I2C_LCD


void setup(void)
{
    Wire.begin();   
    LCD.CleanAll(WHITE);
    afficherImage(&bmimage,0,0);
}

void loop(void)
{
}
