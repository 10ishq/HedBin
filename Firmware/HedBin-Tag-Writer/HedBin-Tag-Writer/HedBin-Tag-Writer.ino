#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#define RST_PIN D0   // Set RST_PIN to D0
#define SS_PIN D8    // Set SS_PIN to D8

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

// Define the password for authentication (replace with your NFC tag password)
byte password[] = {0xFF, 0xFF, 0xFF, 0xFF};

const char* ssid = "gabraal";
const char* wifipass = "nimishhh";

ESP8266WebServer server(80);

String productID = "";

void setup() {
  Serial.begin(9600);
  while (!Serial); // Wait for serial port to connect

  WiFi.begin(ssid, wifipass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.onNotFound(handleNotFound);

  server.begin();

  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println(F("Scan PICC to see UID, type, and data blocks..."));
}

void loop() {
  server.handleClient();

  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  byte pACK[2];
  Serial.print("Auth: ");
  Serial.println(mfrc522.PCD_NTAG216_AUTH(password, pACK));

  Serial.print(pACK[0], HEX);
  Serial.println(pACK[1], HEX);

  if (!productID.isEmpty()) {
    byte page4Data[4] = {productID[0], productID[1], productID[2], productID[3]};
    Serial.print("Write to Page 4: ");
    Serial.println(mfrc522.MIFARE_Ultralight_Write(4, page4Data, 4));

    byte page5Data[4] = {productID[4], productID[5], productID[6], productID[7]};
    Serial.print("Write to Page 5: ");
    Serial.println(mfrc522.MIFARE_Ultralight_Write(5, page5Data, 4));

    productID = "";
  }

  byte readBuffer4[18];
  byte bytesRead4 = sizeof(readBuffer4);
  mfrc522.MIFARE_Read(4, readBuffer4, &bytesRead4);

  byte readBuffer5[18];
  byte bytesRead5 = sizeof(readBuffer5);
  mfrc522.MIFARE_Read(5, readBuffer5, &bytesRead5);

  Serial.print("Read: ");
  for (byte i = 0; i < 4; i++) {
    if (readBuffer4[i] != 0) {
      Serial.write(readBuffer4[i]);
    }
  }
  Serial.println(" ");
  for (byte i = 0; i < 4; i++) {
    if (readBuffer5[i] != 0) {
      Serial.write(readBuffer5[i]);
    }
  }
  Serial.println();

  delay(3000);
}

void handleRoot() {
  if (server.args() > 0) {
    productID = server.arg("productId");
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(200, "text/plain", "OK");
}

void handleNotFound() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(404, "text/plain", "Not Found");
}
