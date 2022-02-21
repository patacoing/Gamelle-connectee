#include <WiFiNINA.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <ArduinoHttpClient.h>

#define HEADER 0
#define JSON 1
#define MONPORT 80
char ssid[] = "Jsuis une formule1";     // SSID (nom)
char pass[] = "pgmf12020";              // mot de passe
int status = WL_IDLE_STATUS;            // status
char server[] = "192.168.43.122";       //IP du serveur distant
String s = "{\"Arduino\" : \"Hello\"}"; //JSON à envoyer au serveur
String id;
WiFiClient wifi;
WebSocketClient client = WebSocketClient(wifi, server, MONPORT); //création du web socket
int i = 0;
void setup()
{
    Serial.begin(9600);
    while (!Serial)
        ;
    myId(); //on renseigne notre id
    Serial.println(id);
    initWifi();
    printData();
    initSocket(); //on démarre la connection permanente entre l'arduino et le serveur
}

void loop()
{
    Serial.println("----------------------------------------");
    getMessage();
    sendMessage(s);
    delay(3000);
    Serial.println("----------------------------------------");
}

void myId()
{
    byte mac[8];
    WiFi.macAddress(mac);
    for (int i = 0; i < 8; i++)
        id.concat(mac[i]);
}

void printData()
{
    Serial.println("Board Information:");
    // print your board's IP address:
    IPAddress ip = WiFi.localIP();
    Serial.print("IP Address: ");
    Serial.println(ip);

    Serial.println();
    Serial.println("Network Information:");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());

    // print the received signal strength:
    long rssi = WiFi.RSSI();
    Serial.print("signal strength (RSSI):");
    Serial.println(rssi);

    byte encryption = WiFi.encryptionType();
    Serial.print("Encryption Type:");
    Serial.println(encryption, HEX);
    Serial.println();
}
void initWifi()
{
    while (status != WL_CONNECTED)
    {
        Serial.print("Tentative de connection au wifi...");
        Serial.println(ssid);
        // Connect to WPA/WPA2 network:
        status = WiFi.begin(ssid, pass);
        // wait 5 seconds for connection:
        delay(5000);
    }
    // you're connected now, so print out the data:
    Serial.println("Connecté au wifi!");
}

void initSocket()
{
    int connection;
    do
    {
        Serial.println("Tentative de connection");
        client.begin();
        Serial.print("Resultat:");
        connection = client.connected();
        Serial.println(connection);
        delay(5000);
    } while (connection != 1);
    Serial.println("Connection réussie!");
}
void checkConnection()
{
    if (client.connected() != 1)
        initSocket();
}

void getMessage()
{
    DynamicJsonDocument json(2048); //on créée un json dynamic
    int messageSize = client.parseMessage();
    if (messageSize > 0)
    { //si la taille est supérieur à 0 on a un message
        Serial.println("Nouveau Message!");
        String result = client.readString(); //on lit le contenu
        Serial.println(result);
        auto error = deserializeJson(json, result); //on va créer un tableau avec les données
        if (error)
        {
            Serial.println("parseObject() failed");
        }
    }
    String s = json["status"];
    if (s.equals("null"))
    { //Si le contenu est null
        Serial.println("perdu!");
        checkConnection(); // on regarde la connection et on retente si perdu
    }
    else
    {
        //traitement(json);
    }
    Serial.println(s);
    delay(1000);
}

void sendMessage(String json)
{
    client.beginMessage(TYPE_TEXT);
    client.print(json);
    client.endMessage();
}
