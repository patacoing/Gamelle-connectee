#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

char ssid[] = "FREEBOX_LUC_Y7";   // SSID (nom)
char pass[] = "watterdal62380";   // mot de passe
int status = WL_IDLE_STATUS;      // status
char server[] = "192.168.43.137"; // IP du serveur distant
String id;

WiFiClient wifi;
WebSocketClient client = WebSocketClient(wifi, server, MONPORT); // création du web socket
int i = 0;
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
void myId()
{
    byte mac[8];
    WiFi.macAddress(mac);
    for (int i = 0; i < 8; i++)
        id.concat(mac[i]);
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
/**
DynamicJsonDocument getMessage()
{
    DynamicJsonDocument json(2048);
    int messageSize = client.parseMessage();
    if (messageSize > 0)
    {
        Serial.println("Nouveau Message!");
        String result = client.readString();
        Serial.println(result);
        auto error = deserializeJson(json, result);
        if (error)
        {
            Serial.println("parseObject() failed");
        }
    }
    String s = json["status"];
    if (s.equals("null"))
    { // Si le contenu est null
        Serial.println("perdu!");
        checkConnection(); // on regarde la connection et on retente si perdu
    }
    else
    {
        // traitement(json);
        return json;
    }
    Serial.println(s);
    delay(1000);
}*/

DynamicJsonDocument getMessage()
{
    DynamicJsonDocument json(2048);
    int messageSize = client.parseMessage();
    if (messageSize > 0)
    {
        Serial.println("Nouveau Message!");
        String result = client.readString();
        Serial.println(result);
        auto error = deserializeJson(json, result);
        if (error)
        {
            Serial.println("parseObject() failed");
        }
    }
    return json;
}

DynamicJsonDocument requestData(String action)
{
    String s = "{\"action\":";
    s.concat(action);
    s.concat(",");
    s.concat("\"id\":");
    s.concat(id);
    s.concat("}");
    Serial.println(s);
    sendMessage(s);
    delay(100);
    return waitMessage();
}

DynamicJsonDocument getAllMeal()
{
    DynamicJsonDocument json = requestData("requestData");
    return json;
}

DynamicJsonDocument getNextMeal()
{
    DynamicJsonDocument json = requestData("nextMeal");
    return json;
}

DynamicJsonDocument waitMessage()
{ // on ne reçoit peut-etre pas directement le message si on a de la latence, donc on retente si on ne reçoit rien, de plus on regarde si on est encore connecté
    DynamicJsonDocument json = getMessage();
    while (!json["action"].isNull())
    {
        delay(100);
        checkConnection();
        json = getMessage();
    }
    return json;
}

void checkMessage()
{
    DynamicJsonDocument json = getMessage();

    if (!json["action"].isNull())
    {
        Serial.println("action!");
        /** if (json["action"] == "manger")
             distribution(json["poids"]);*/
    }
}
void deleateMeal(int index, DynamicJsonDocument json)
{
    String s = "{\"action\":\"deleateMeal\", \"id\":";
    s.concat(id);
    String repasId = json["repas"][index]["id"];
    s.concat("\"repasID\":");
    s.concat(repasId);
    s.concat("}");
    Serial.println(s);
    sendMessage(s);
    // TODO: faire des modifications pour l'écran
}

void updateData(int index, int heure, int poids, DynamicJsonDocument json)
{
    String s = "{\"action\":\"update\", \"id\":";
    s.concat(id);
    String repasId = json["repas"][index]["id"];
    s.concat("\"repasID\":");
    s.concat(repasId);
    s.concat("\"heure\":\"");
    s.concat(heure);
    s.concat("\"poids\":\"");
    s.concat(poids);
    s.concat("}");
    Serial.println(s);
    sendMessage(s);
}

void distribution(int poids)
{
    // TODO: allumer moteur pas à pas et regarder le poids du capteur
}

void sendMessage(String json)
{
    checkConnection();
    client.beginMessage(TYPE_TEXT);
    client.print(json);
    client.endMessage();
}
