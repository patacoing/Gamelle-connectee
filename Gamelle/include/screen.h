#ifndef I2C
#define I2C
#include <I2C_LCD.h>
#endif

#ifndef WIRE
#define WIRE
#include <Wire.h>
#endif

#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

#ifndef STRING_H
#define STRING_H

#define X_MAX 128
#define Y_MAX 64

void initScreen();
void welcome();
void mainMenu();
boolean afficherString(char *chaine, uint8_t x, uint8_t y);
void changerTaillePolice(enum LCD_FontSort font, enum LCD_CharMode cMode);
void cleanFont(uint8_t x, uint8_t y, uint8_t width, uint8_t height, enum LCD_DrawMode cMode);
void afficherImage(GUI_Bitmap_t *image, uint8_t x, uint8_t y);
void afficher(uint8_t x, uint8_t y);

#endif