var express = require('express');
const SerialPort = require('serialport');
var mongoose = require('mongoose');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
});

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

/**Define models */
let User = require('./models/user');
let Sensor = require('./models/sensors');

//connect to mongodb
mongoose.connect('mongodb://127.0.0.1:27017/Edge');

//on successful connection
mongoose.connection.on('connected', () => {
    console.log('Connected to mongodb!!');
});

//on error
mongoose.connection.on('error', (err) => {
    if (err) {
        console.log('Error in db is :' + err);
    }
});

/**Routings */

/**Store user informations */
app.post('/userRegistration', function (request, response) {
    let userDetails = {};
    let data = new User();
    data.name = request.body.name;
    data.email = request.body.email;
    data.loginTime = new Date();

    data.save(function (error, result) {
        if (error) {
            userDetails.error = true;
            userDetails.message = `User details not saved.`;
            response.status(404).json(userDetails);
        } else if (result) {
            userDetails.error = false;
            userDetails.userDetails = result;
            userDetails.message = `User Details.`;
            response.status(200).json(userDetails);
        }
    });
});

io.on('connection', function (client) {
    console.log("Socket connected !");

    client.on("start", function (data) {
        let status = data.status;
        /**Body Temparature Measurement
         * Taking 200 as input from frontend 
         */
        if (status == "200") {
            var buffer = new Buffer(1);
            buffer.writeInt8(100);
            port.write(buffer);
        }
        /**Blood Presure Measurement
         * Taking 201 as input from frontend 
         */
        else if (status == "201") {
            var buffer = new Buffer(1);
            buffer.writeInt8(101);
            port.write(buffer);
        }

        /**EMG Measurement
         * Taking 202 as input from frontend 
         */
        else if (status == "202") {
            var buffer = new Buffer(1);
            buffer.writeInt8(102);
            port.write(buffer);
        }
    });

    /**Getting values from arduino and save value in local server*/
    parser.on('data', function (data) {
        client.emit('value', { "value": data });
    });
});

/**User Login */
app.get('/login', function (request, response) {
    let userDetails = {};
    let email = request.body.email;
    User.find({ email: email }, function (error, result) {
        if (error) {
            userDetails.error = true;
            userDetails.message = `User not log in.`;
            response.status(404).json(userDetails);
        } else if (result) {
            userDetails.error = false;
            userDetails.userDetails = result;
            userDetails.message = `User Details.`;
            response.status(200).json(userDetails);
        }
    });
});

/**Saving Sensor Values */
app.post('/sensorValues', function (request, response) {
    let details = {};
    let data = new Sensor();
    data.userId = request.body.userId;
    data.forEach(function (element) {
        element.value.time = new Date();

        element.value.bodyTemparature = request.body.bodyTemparature;

        element.value.bloodPresure.diastolic = request.body.diastolic;
        element.value.bloodPresure.systolic = request.body.systolic;
        element.value.bloodPresure.pulse = request.body.pulse;

        element.value.EMG = request.body.EMG;
    });
    data.save(function (error, result) {
        if (error) {
            details.error = true;
            details.message = `Sensor details getting error.`;
            response.status(404).json(details);
        } else if (result) {
            details.error = false;
            details.Details = result;
            details.message = `Sensor Details.`;
            response.status(200).json(details);
        }
    });
});

/**Update Sensor value */
app.put('/updateSensorValues', function (request, response) {
    let details = {};
    Sensor.find({ _id: request.body.sensorId }, function (error, res) {
        if (error) {
            details.error = true;
            details.message = `Sensor not find.`;
            response.status(404).json(details);
        } else if (res) {
            res.forEach(function (element) {
                element.value.bodyTemparature = request.body.bodyTemparature;

                element.value.bloodPresure.diastolic = request.body.diastolic;
                element.value.bloodPresure.systolic = request.body.systolic;
                element.value.bloodPresure.pulse = request.body.pulse;

                element.value.EMG = request.body.EMG;
            });
            res.save(function (error, result) {
                if (error) {
                    details.error = true;
                    details.message = `Sensor value not updated.`;
                    response.status(404).json(details);
                } else if (result) {
                    details.error = false;
                    details.Details = res;
                    details.message = `Sensor Details.`;
                    response.status(200).json(details);
                }
            });
        }
    });
});

const PORT = 7000;
server.listen(PORT, function () {
    console.log("Server started");
});
