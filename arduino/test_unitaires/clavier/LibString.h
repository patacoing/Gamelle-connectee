#ifndef STRING_H
#define STRING_H

#define X_MAX 128
#define Y_MAX 64


boolean afficherString(char *chaine,uint8_t x,uint8_t y);
void changerTaillePolice(enum LCD_FontSort font, enum LCD_CharMode cMode);

#endif