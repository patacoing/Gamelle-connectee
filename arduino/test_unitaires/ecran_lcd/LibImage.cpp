#include <Arduino.h>
#include <I2C_LCD.h>

#include "libImage.h"

extern I2C_LCD LCD;

/**
 * Fonction affichant une image sur le LCD à la position x,y
 * image est une variable externe (fichier dans le même répertoire que le .ino)
 */
boolean afficherImage(GUI_Bitmap_t *image, uint8_t x, uint8_t y) {
  if(x >= X_MAX || y >= Y_MAX) return false;
  LCD.WorkingModeConf(ON, ON, WM_BitmapMode);
  LCD.DrawScreenAreaAt(image,x,y);
  return true;
}