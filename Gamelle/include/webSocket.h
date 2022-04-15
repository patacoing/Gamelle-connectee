#ifndef JSON
#define JSON
#include <ArduinoJson.h>
#endif

#ifndef HTTPCLIENT
#include <ArduinoHttpClient.h>
#define HTTPCLIENT
#endif

#ifndef ID
#include <ArduinoUniqueID.h>
#define ID
#endif

#ifndef WIFI
#include <WiFiNINA.h>
#define WIFI
#endif

#ifndef SPI
#include <SPI.h>
#define spi
#endif

#define MONPORT 80

DynamicJsonDocument getMessage();
DynamicJsonDocument getAllMeal();
DynamicJsonDocument requestData(String action);
DynamicJsonDocument getNextMeal();
DynamicJsonDocument waitMessage();
void sendMessage(String json);
void initSocket();
void checkConnection();
void initWifi();
void checkMessage();
void myId();
void printData();
void updateData(int index, int heure, int poids, DynamicJsonDocument json);
void deleateMeal(int index, DynamicJsonDocument json);