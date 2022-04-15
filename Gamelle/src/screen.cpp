#ifndef SCREEN
#define SCREEN
#include <screen.h>
#endif

I2C_LCD LCD;

extern GUI_Bitmap_t bmbienvenue;
extern GUI_Bitmap_t bmmenu_principal;

uint8_t I2C_LCD_ADDRESS = 0x51; // Device address configuration, the default value is 0x51.

/**
 * Fonction pour afficher une chaîne de caractères suivant l'abscisse et l'ordonnée
 * y < 64, x < 128
 */
boolean afficherString(char *chaine, uint8_t x, uint8_t y)
{
  if (y >= Y_MAX || x >= X_MAX)
    return false;
  LCD.WorkingModeConf(ON, ON, WM_CharMode);
  LCD.DispStringAt(chaine, x, y);
  return true;
}

/**
 * Fonction permettant de changer la taille de la police
 * font : taille de la police Font_6*8 , Font_6*12, Font_8*16, Font_10*20, Font_12*24, Font_16*32
 * mode d'affichage du carcatère : WHITE_BAC, WHITE_NO_BAC, BLACK_BAC, BLACK_NO_BAC
 * BAC : background
 */
void changerTaillePolice(enum LCD_FontSort font, enum LCD_CharMode cMode)
{
  LCD.FontModeConf(font, FM_ANL_AAA, cMode);
}

void cleanFont(uint8_t x, uint8_t y, uint8_t width, uint8_t height, enum LCD_DrawMode cMode)
{
  LCD.DrawRectangleAt(x, y, width, height, cMode);
}
/*
void afficher(uint8_t x, uint8_t y)
{
  cleanFont(x, y, 8, 16, WHITE_FILL);
  afficherString(c, x, y);
}*/
void welcome()
{
  afficherImage(&bmbienvenue, 0, 0);
}
void mainMenu()
{
  DynamicJsonDocument json = requestData("requestData");
  afficherImage(&bmmenu_principal, 0, 0);
}
void initScreen()
{
  Wire.begin();
  LCD.CleanAll(WHITE);
}

void afficherImage(GUI_Bitmap_t *image, uint8_t x, uint8_t y)
{
  if (x >= X_MAX || y >= Y_MAX)
    return;
  LCD.WorkingModeConf(ON, ON, WM_BitmapMode);
  LCD.DrawScreenAreaAt(image, x, y);
}
