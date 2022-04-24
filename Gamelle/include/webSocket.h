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

#define MONPORT 8100

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
void updateData(int index, String heure, int poids, DynamicJsonDocument json);
void deleteMeal(int index, DynamicJsonDocument json);
void addMeal(String heure, int poids);
void addHistorique(int poids);