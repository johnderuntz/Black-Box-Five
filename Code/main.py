from flask import Flask, render_template, jsonify
from databaseInteract import writeDB, readDB
from sensorRead import dbData
import datetime


#variables
webUI = True                        #default webUI on
dataLogging = False                 #default dataLogging off
timeFormat = "%Y-%m-%d %H:%M:%S.%L" #formatting for time for database entries - YYYY-MM-DD HH:MM:SS.sss  
sampleFrequency = 0.5               #default to 0.5sec, allow updates via webpage
webPort = 80                        #port 80 for http requests

#flask app intiation
app = Flask(__name__)

#main webpage
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/data')         #json for current data
def data():         
    lateral_acc, vertical_acc, vel, height = dbData()
    return jsonify(
        lateral_acc = lateral_acc,
        vertical_acc = vertical_acc,
        velocity = vel,
        height = height
        )

@app.route('/chart')        #json for past database entries
def chart():
    time, lateral_acc, vertical_acc, vel, height = readDB(1000)
    return jsonify(
        time = time,
        lateral_acceleration = lateral_acc,
        vertical_acceleration = vertical_acc,
        velocity = vel,
        height = height
    )

#log data function
def logData():
    lateral_acc, vertical_acc, vel, height = dbData()                                   #get sensor data
    currentTime = datetime.datetime.now()                                               #get current time
    writeDB(currentTime.strftime(timeFormat), lateral_acc, vertical_acc, vel, height)   #log data

#if webUI true, start webserver
if webUI:
    app.run(debug=True, port=webPort)

#NEEDS LOGIC TO STOP RUNNING WHEN CONDITIONS ARE MET (PHYSICAL BUTTON START/STOP)
#NEEDS LOGIC TO CHOOSE TO CLEAR DATABASE
#NEEDS LOGIC TO SHUTDOWN WEBSITE
#NEEDS OLED SCREEN CONTROL TO DISPLAY WEBPAGE/RECORDING STATUS
#NEEDS LOGIC TO START/STOP DATA RECORDING

