
#define MENU_CREATION 'A'
#define MENU_SUPPRESSION 'B'
#define MENU_MODIFICATION 'C'

#define SUPPRESSION 1
#define MODIFICATION 2

#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

void traitementMenuPrincipal(char c);
void traitementClavier(char c);
void traitementAjout();
void traitementUpdateDelete(char choix);
char getMenu();
DynamicJsonDocument afficherMenu();
char getPoids();
char *getHeure();
char checkHeure();
char checkMinute();
void traitementUpdate(int index);