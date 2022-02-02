#include <WiFiNINA.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <ArduinoHttpClient.h>


#define HEADER 0
#define JSON 1
#define MONPORT 80
char ssid[] = "CarlosMagni";       // SSID (nom)
char pass[] = "qqqqqqqq";    // mot de passe
int status = WL_IDLE_STATUS;     // status
char server[] = "192.168.43.137"; //IP du serveur distant
String id;
WiFiClient wifi;
WebSocketClient client = WebSocketClient(wifi,server,MONPORT); //création du web socket
int i = 0;
void setup() {
  Serial.begin(9600);
  while (!Serial);
  myId(); //on renseigne notre id
  Serial.println(id);
  initWifi();
  printData();
  initSocket(); //on démarre la connection permanente entre l'arduino et le serveur
  logIn();
  
}

void loop() {
  Serial.println("----------------------------------------");
  getMessage();
  delay(3000);
  logIn();
  delay(1000);
  Serial.println("----------------------------------------");
}

void printData() {
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
void initWifi(){
    while (status != WL_CONNECTED) {
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
void myId(){
  byte mac[8];
  WiFi.macAddress(mac);
  for(int i = 0; i < 8; i++)
    id.concat(mac[i]);
}

void initSocket(){
  int connection;
  do{
  Serial.println("Tentative de connection");
  client.begin();
  Serial.print("Resultat:");
  connection = client.connected();
  Serial.println(connection);
  delay(5000);
  }
  while(connection != 1);
  Serial.println("Connection réussie!");
}
void checkConnection(){
  if(client.connected() != 1) initSocket();
}

void getMessage(){
  DynamicJsonDocument json(2048);
  int messageSize = client.parseMessage();
  if(messageSize > 0){
      Serial.println("Nouveau Message!");
      String result = client.readString();
      Serial.println(result);
      auto error = deserializeJson(json, result);
      if (error)
      {
        Serial.println("parseObject() failed");
      }
    } 
  if(s.equals("null")) { //Si le contenu est null
    Serial.println("perdu!"); 
    checkConnection();// on regarde la connection et on retente si perdu
  }
  else{
    traitement(json);
  }
  Serial.println(s);
  delay(1000);
}

void logIn(){
  String s = "{\"action\":\"requestData\",";
  s.concat("\"id\":\"");
  s.concat(id);
  s.concat("\"}"); 
  Serial.println(s);
  sendMessage(s);
}

void traitement(DynamicJsonDocument json){
  if(json["action"] == "modifier"){
    modification(json);
  }
  else if(json["action"] == "manger"){
    distribution(json["poids"]);
  }
}
void modification(DynamicJsonDocument json){
  String s = json["poids"];
  Serial.println(s);
  //TODO: faire des modifications pour l'écran
}

void distribution(int poids){
  //TODO: allumer moteur pas à pas et regarder le poids du capteur
}

void sendMessage(String json){
  client.beginMessage(TYPE_TEXT);
  client.print(json);
  client.endMessage(); 
}
