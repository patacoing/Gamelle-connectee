

#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

#ifndef CLAVIER
#define CLAVIER
#include <clavier.h>
#endif

#ifndef TRAITEMENT
#define TRAITEMENT
#include <traitement.h>
#endif

#ifndef SCREEN
#define SCREEN
#include <screen.h>
#endif

extern String id;
extern int dirPin = 9;
extern int stepPin = 10;
extern int enable = 8;
DynamicJsonDocument json(2048);
void setup()
{
    Serial.begin(9600);
    pinMode(stepPin, OUTPUT);
    pinMode(dirPin, OUTPUT);
    pinMode(enable, OUTPUT);
    digitalWrite(enable, LOW);
    initScreen();
    welcome();
    myId(); // on renseigne notre id
    Serial.println(id);
    initWifi();
    printData();
    initSocket(); // on démarre la connection permanente entre l'arduino et le serveur
    mainMenu();
    nextMeal();
}

void loop()
{
    //   Serial.println("----------------------------------------");
    checkMessage();
    checkKeypad();
    //  Serial.println("----------------------------------------");
}
