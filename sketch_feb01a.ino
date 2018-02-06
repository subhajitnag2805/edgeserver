#include <MySignals.h>
#include "Wire.h"
#include "SPI.h"

//Declare Variables
int input;

void setup()
{
  Serial.begin(115200);
  MySignals.begin();

  /**For measuring Blood Presure */
  MySignals.initSensorUART();
  MySignals.enableSensorUART(BLOODPRESSURE);

  /**For measuring EMG */
  MySignals.initInterrupt(10);
  // CPM flag initialization
  MySignals.EMGFlagCPM = 1;
}


void loop()
{
  //Loop Check until data is not received
  while (!Serial.available());
  input = Serial.read();

  /**Body Temparature Measurement
    Taking 100 as input from node.js for measuring temparature
  */
  if (input == 100) {
    float temperature = MySignals.getTemperature();
    Serial.println(temperature, 2);
    delay(1000);
  }

  /**Blood Presure Mesurement
    Taking 101 as input from node.js for measuring blood presure
  */
  if (input == 101) {
    if (MySignals.getStatusBP())
    {
      delay(1000);
      if (MySignals.getBloodPressure() == 1)
      {
        MySignals.disableMuxUART();
        Serial.println();
        Serial.print("Diastolic: ");
        Serial.println(MySignals.bloodPressureData.diastolic);
        Serial.print("Systolic: ");
        Serial.println(MySignals.bloodPressureData.systolic);
        Serial.print("Pulse/min: ");
        Serial.println(MySignals.bloodPressureData.pulse);
        MySignals.enableMuxUART();
      }
    }
    delay(1000);
  }

  /**EMG Measurement
    Taking 102 as input from node.js for measuring EMG
  */
  if (input == 102) {
    Serial.print("EMG rate = ");
    Serial.print(MySignals.EMGDataCPMBalanced);
    Serial.println(" cpm ");

    delay(1000);
  }

}
