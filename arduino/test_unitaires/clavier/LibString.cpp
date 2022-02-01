#include <Arduino.h>
#include <I2C_LCD.h>

#include "LibString.h"
extern I2C_LCD LCD;

/**
 * Fonction pour afficher une chaîne de caractères suivant l'abscisse et l'ordonnée
 * y < 64, x < 128
 */
boolean afficherString(char *chaine,uint8_t x,uint8_t y){
  if(y >= Y_MAX || x >= X_MAX) return false;
  LCD.WorkingModeConf(ON, ON, WM_CharMode);
  LCD.DispStringAt(chaine,x,y); 
  return true;
}

/**
 * Fonction permettant de changer la taille de la police
 * font : taille de la police Font_6*8 , Font_6*12, Font_8*16, Font_10*20, Font_12*24, Font_16*32
 * mode d'affichage du carcatère : WHITE_BAC, WHITE_NO_BAC, BLACK_BAC, BLACK_NO_BAC
 * BAC : background 
 */
void changerTaillePolice(enum LCD_FontSort font, enum LCD_CharMode cMode){
  LCD.FontModeConf(font,FM_ANL_AAA, cMode);
}