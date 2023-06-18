#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <qrcode.h>

#include <Servo.h>

Servo myservo; 

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

#define RST_PIN D0   // Set RST_PIN to D0
#define SS_PIN D8    // Set SS_PIN to D8
MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance



// Define the password for authentication (replace with your NFC tag password)
byte password[] = {0xFF, 0xFF, 0xFF, 0xFF};

const int qrCodeVersion = 3;
const int pixelSize = 2;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);


void displayScrollingText() {


  int16_t scrollPos = SCREEN_WIDTH;
  while (scrollPos >= -SCREEN_WIDTH * 12) {
    display.clearDisplay();
    display.setTextSize(8);
    display.setTextColor(WHITE);
    display.setCursor(scrollPos, 0);
    display.println("GreenFlowChain");
    display.display();
    delay(5);
    scrollPos--;
  }
}
void showQRCode(String qrCodeString) {
  QRCode qrcode;

  uint8_t qrcodeBytes[qrcode_getBufferSize(qrCodeVersion)];
  qrcode_initText(&qrcode, qrcodeBytes, qrCodeVersion, ECC_LOW,
                  qrCodeString.c_str());

  display.clearDisplay();

  int startX = (SCREEN_WIDTH - (qrcode.size * pixelSize) - (pixelSize * 2))
               / 2;
  int startY = (SCREEN_HEIGHT - (qrcode.size * pixelSize) - (pixelSize * 2))
               / 2;

  int qrCodeSize = qrcode.size;

  display.fillRect(startX, startY, (qrCodeSize * pixelSize) + (pixelSize * 2),
                   (qrCodeSize * pixelSize) + (pixelSize * 2), WHITE);

  for (uint8_t y = 0; y < qrCodeSize; y++) {
    for (uint8_t x = 0; x < qrCodeSize; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        display.fillRect(x * pixelSize + startX + pixelSize,
                         y * pixelSize + startY + pixelSize, pixelSize,
                         pixelSize, BLACK);
      }
    }
  }
  display.display();
}

const char* ssid = "gabraal";
const char* wifipass = "nimishhh";

// Your Domain name with URL path or IP address with path
String serverName = "https://192.168.29.115:3001/checkProduct?productHash=";

// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastTime = 0;
// Timer set to 10 minutes (600000)
// unsigned long timerDelay = 600000;
// Set timer to 5 seconds (5000)
unsigned long timerDelay = 5000;


const int PRODUCT_HASH_LENGTH = 11;  // Define the desired length of the product hash

//*****************************************************************************************//
void setup() {
  myservo.attach(2);
  Serial.begin(9600); 
  SPI.begin();                                                  // Init SPI bus
  WiFi.begin(ssid, wifipass);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  mfrc522.PCD_Init();                                              // Init MFRC522 card
//  displayScrollingText();
}

//*****************************************************************************************//
void loop() {
// Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  byte pACK[2]; // 16-bit password ACK returned by the NFC tag.

  Serial.print("Auth: ");
  Serial.println(mfrc522.PCD_NTAG216_AUTH(password, pACK)); // Request authentication. Return value 0 indicates success.

  // Print PassWordACK
  Serial.print(pACK[0], HEX);
  Serial.println(pACK[1], HEX);
String pID = "";
  // Read the data from Page 4
  byte readBuffer4[18];
  byte bytesRead4 = sizeof(readBuffer4);
  mfrc522.MIFARE_Read(4, readBuffer4, &bytesRead4);

  // Read the data from Page 5
  byte readBuffer5[18];
  byte bytesRead5 = sizeof(readBuffer5);
  mfrc522.MIFARE_Read(5, readBuffer5, &bytesRead5);


    // Print the read data
  Serial.print("Read: ");
  for (byte i = 0; i < 4; i++) {
    if (readBuffer4[i] != 0) {
      Serial.write(readBuffer4[i]);
      pID+=char(readBuffer4[i]);
    }
  }
  Serial.println(" ");
  for (byte i = 0; i < 4; i++) {
    if (readBuffer5[i] != 0) {
      Serial.write(readBuffer5[i]);
      pID+=char(readBuffer5[i]);
    }
  }
  Serial.println();
  Serial.println(pID);



  // CHECK IF PRODUCT HASH LENGTH REACHED DESIRED VALUE
  if (pID.length() == 8) {
    processProductHash(pID);  // Pass the product hash to the function for printing
  }

  delay(1000); // Change value if you want to read cards faster

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

//*****************************************************************************************//

// Function to send an HTTP request
void sendHttpRequest(const String& url) {
  // Check WiFi connection status
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // Your Domain name with URL path or IP address with path
    http.begin(client, url.c_str());

    // If you need Node-RED/server authentication, insert user and password below
    // http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

    // Send HTTP GET request
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
      if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
      if (httpResponseCode == 200) {
        display.clearDisplay();
        display.setTextSize(2);
        display.setTextColor(WHITE);
        display.setCursor(0, 0);
        display.println("Please Claim reward");
        display.println("in next 2 minutes");
        display.display();
        delay(5000);
        showQRCode("http://192.168.29.115:3000/" + payload);
        delay(20000);

        int pos;
            for (pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
                            // in steps of 1 degree
             myservo.write(pos);              // tell servo to go to position in variable 'pos'
              delay(15);                       // waits 15ms for the servo to reach the position
              }
          delay(3000);
          for (pos = 180; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
             myservo.write(pos);              // tell servo to go to position in variable 'pos'
              delay(15);                       // waits 15ms for the servo to reach the position
             }
//        displayScrollingText();
          display.clearDisplay();
          display.display();
      }
    }
    else {
      
      Serial.println(httpResponseCode);
    }
    }
    else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    // Free resources
    http.end();
  }
  else {
    Serial.println("WiFi Disconnected");
  }
}

// Function to print the product hash
void processProductHash(const String& pHash) {
  Serial.println(pHash);
  // Send an HTTP POST request depending on timerDelay
  if ((millis() - lastTime) > timerDelay) {
    String serverPath = serverName + pHash;
    sendHttpRequest(serverPath);
    lastTime = millis();
  }
}
