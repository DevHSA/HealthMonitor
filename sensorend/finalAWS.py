#!/usr/bin/env python
#
# Analog Input with ADC0832 chip
#
# Datasheet: http://www.ti.com/lit/ds/symlink/adc0838-n.pdf
# Part of SunFounder LCD StarterKit
# http://www.sunfounder.com/index.php?c=show&id=21&model=LCD%20Starter%20Kit
#

#SENSOR DATA IMPORTS
import time
import os
import RPi.GPIO as GPIO
import glob
import random
import json

#AWS IOTSDK Imports
from awscrt import io, mqtt, auth, http
from awsiot import mqtt_connection_builder


# Define ENDPOINT, CLIENT_ID, PATH_TO_CERTIFICATE, PATH_TO_PRIVATE_KEY, PATH_TO_AMAZON_ROOT_CA_1, MESSAGE, TOPIC, and RANGE
ENDPOINT = "a94hz08bsubl1-ats.iot.us-east-1.amazonaws.com"
CLIENT_ID = "testDevice"
PATH_TO_CERTIFICATE = "creds/certificate.pem.crt"
PATH_TO_PRIVATE_KEY = "creds/private.pem.key"
PATH_TO_AMAZON_ROOT_CA_1 = "creds/root.pem"
TOPIC = "health/sensor"

#Taken from the AWS official connections template
event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)

##Build the mqtt AWS IOT Connection string
mqtt_connection = mqtt_connection_builder.mtls_from_path(
            endpoint=ENDPOINT,
            cert_filepath=PATH_TO_CERTIFICATE,
            pri_key_filepath=PATH_TO_PRIVATE_KEY,
            client_bootstrap=client_bootstrap,
            ca_filepath=PATH_TO_AMAZON_ROOT_CA_1,
            client_id=CLIENT_ID,
            clean_session=False,
            keep_alive_secs=6
            )

##Print connection test string
print("Connecting to {} with client ID '{}'...".format(ENDPOINT, CLIENT_ID))

## Make the connect() call
connect_future = mqtt_connection.connect()

# Future.result() waits until a result is available. Ensure that we have a connection
connect_future.result()

print("Connected!")


GPIO.setmode(GPIO.BCM)


# change these as desired - they're the pins connected from the
# SPI port on the ADC to the Cobbler
PIN_CLK = 18
PIN_DO  = 27
PIN_DI  = 22
PIN_CS  = 17

# set up the SPI interface pins
GPIO.setup(PIN_DI,  GPIO.OUT)
GPIO.setup(PIN_DO,  GPIO.IN)
GPIO.setup(PIN_CLK, GPIO.OUT)
GPIO.setup(PIN_CS,  GPIO.OUT)

# These tow lines mount the device:
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
 
base_dir = '/sys/bus/w1/devices/'
# Get all the filenames begin with 28 in the path base_dir.
device_folder1 = glob.glob(base_dir + '28*')[0]
device_folder2 = glob.glob(base_dir + '28*')[1]
device_file1 = device_folder1 + '/w1_slave'
device_file2 = device_folder2 + '/w1_slave'


# read SPI data from ADC8032
def getADC(channel):
	# 1. CS LOW.
        GPIO.output(PIN_CS, True)      # clear last transmission
        GPIO.output(PIN_CS, False)     # bring CS low

	# 2. Start clock
        GPIO.output(PIN_CLK, False)  # start clock low

	# 3. Input MUX address
        for i in [1,1,channel]: # start bit + mux assignment
                 if (i == 1):
                         GPIO.output(PIN_DI, True)
                 else:
                         GPIO.output(PIN_DI, False)

                 GPIO.output(PIN_CLK, True)
                 GPIO.output(PIN_CLK, False)

        # 4. read 8 ADC bits
        ad = 0
        for i in range(8):
                GPIO.output(PIN_CLK, True)
                GPIO.output(PIN_CLK, False)
                ad <<= 1 # shift bit
                if (GPIO.input(PIN_DO)):
                        ad |= 0x1 # set first bit

        # 5. reset
        GPIO.output(PIN_CS, True)

        return ad
    
def read_rom(device_folder):
    name_file=device_folder+'/name'
    f = open(name_file,'r')
    return f.readline()
 
def read_temp_raw(device_file):
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines
 
def read_temp():
    lines1 = read_temp_raw(device_file1)
    lines2 = read_temp_raw(device_file2)
    # Analyze if the last 3 characters are 'YES'.
    while lines1[0].strip()[-3:] != 'YES':
        time.sleep(0.2)
        lines1 = read_temp_raw(device_file1)
        lines2 = read_temp_raw(device_file2)
    # Find the index of 't=' in a string.
    equals_pos1 = lines1[1].find('t=')
    equals_pos2 = lines2[1].find('t=')

    if equals_pos1 != -1:
        # Read the temperature .
        temp1_string = lines1[1][equals_pos1+2:]
        temp2_string = lines2[1][equals_pos2+2:]
        temp1_c = float(temp1_string) / 1000.0
        temp1_f = temp1_c * 9.0 / 5.0 + 32.0
        temp2_c = float(temp2_string) / 1000.0
        temp2_f = temp2_c * 9.0 / 5.0 + 32.0
        return temp1_c, temp1_f, temp2_c, temp2_f


if __name__ == "__main__":
        print(' rom: '+ read_rom(device_folder1),'rom:'+read_rom(device_folder2))
        while True:
                #print ("ADC[0]: {}\t ADC[1]: {}".format(getADC(0), getADC(1)))
                #print(' C1=%3.3f  F1=%3.3f C2=%3.3f  F2=%3.3f  '% read_temp())
                
                tempReading = read_temp()
                pulseReading = getADC(1)
                temp1 = tempReading[0]
                temp2 = tempReading[2]
                pulse1 = pulseReading
                pulse2 = pulseReading
                
                print(tempReading[0])
                print(pulseReading)
                
                timestamp = time.time()
                
                message1 = { "clientID": 11, "timestamp": timestamp, "contact": 9489575958, "temperature" : temp1, "heartrate": pulse1 }
                message2 = { "clientID": 12, "timestamp": timestamp, "contact": 9489575958, "temperature" : temp2, "heartrate": pulse2 }
                

                payload1 = json.dumps(message1)
                payload2= json.dumps(message2)
                
                mqtt_connection.publish(topic=TOPIC, payload=payload1, qos=mqtt.QoS.AT_LEAST_ONCE)

                print("Published: '" + payload1 + "' to the topic: " + "'health/sensor'")
          
                mqtt_connection.publish(topic=TOPIC, payload=payload2, qos=mqtt.QoS.AT_LEAST_ONCE)

                print("Published: '" + payload2 + "' to the topic: " + "'health/sensor'")
          
                time.sleep(2)
               