
#define MENU_CREATION 'A'
#define MENU_SUPPRESSION 'B'
#define MENU_MODIFICATION 'C'
#define MENU_DISTRIBUTION 'D'
#define MENU_APPAIRAGE '*'
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
int getMenu();
DynamicJsonDocument afficherMenu();
int getPoids();
String getHeure();
int checkHeure();
int checkMinute();
void traitementUpdate(int index, DynamicJsonDocument json);
void showNextMeal(DynamicJsonDocument json);
void traitementDistribution();
void nextMeal();
void mainMenu();
void traitementAppairage();
void distribution(int poids);