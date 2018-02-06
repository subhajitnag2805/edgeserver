var express = require('express');
const SerialPort = require('serialport');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
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
// mongoose.connect('mongodb://127.0.0.1:27017/Edge');
mongoose.connect('mongodb://chatUser:password@ds211558.mlab.com:11558/ionic_chat');


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

app.use(cors());

//body-parser
app.use(bodyParser.json());

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

/**Routings */

/**Store user informations */
app.post('/userRegistration', function (request, response) {
    let userDetails = {};
    console.log("User data :");
    console.log(request.body);
    let data = new User();
    data.name = request.body.name,
        data.email = request.body.email,
        data.id = request.body.id,
        data.loginTime = request.body.loginTime
    data.value.forEach(function (element) {
        element.time = request.body.time;
    });
    User.find({ id: request.body.id }, function (error, res) {
        if (error) {
            data.save(function (error, result) {
                if (error) {
                    userDetails.error = true;
                    userDetails.message = `User details not saved.`;
                    response.status(404).json(userDetails);
                } else if (result) {
                    console.log("User result :", result);
                    userDetails.error = false;
                    userDetails.userDetails = result;
                    userDetails.message = `User Details.`;
                    response.status(200).json(userDetails);
                }
            });
        } else if (res) {
            userDetails.error = false;
            userDetails.userDetails = res;
            userDetails.message = `User Details.`;
            response.status(200).json(userDetails);
        }
    });


});

/**Saving Sensor Values */
/**
 *  
 * {
 *   
 * userId:string,
 * time:string,
 * bodyTemparature:string
 * 
 * }
 * 
 * **/
// app.post('/sensorValues', function (request, response) {
//     let details = {};
//     let data = new Sensor();
//     let userId = request.body.userId;
//     Sensor.find({ userId: userId }, function (error, res) {
//         if (error) {
//             data.userId = request.body.userId;
//             data.forEach(function (element) {
//                 element.value.time = request.body.time;

//                 element.value.bodyTemparature = request.body.bodyTemparature;

//                 // element.value.bloodPresure.diastolic = request.body.diastolic;
//                 // element.value.bloodPresure.systolic = request.body.systolic;
//                 // element.value.bloodPresure.pulse = request.body.pulse;

//                 // element.value.EMG = request.body.EMG;
//             });
//             data.save(function (error, result) {
//                 if (error) {
//                     details.error = true;
//                     details.message = `Sensor details getting error.`;
//                     response.status(404).json(details);
//                 } else if (result) {
//                     details.error = false;
//                     details.Details = result;
//                     details.message = `Sensor Details.`;
//                     response.status(200).json(details);
//                 }
//             });
//         } else if (res) {

//         }
//     });
// });

/**Update Sensor value */
/**
 *  
 * {
 *   
 * userId:string,
 * time:string,
 * bodyTemparature:string
 * 
 * }
 * 
 * **/

app.put('/updateSensorValues', function (request, response) {
    let details = {};
    let time = request.body.time;
    User.find({ id: request.body.id }, function (error, res) {
        if (error) {
            details.error = true;
            details.message = `User not find.`;
            response.status(404).json(details);
        } else if (res) {
            res = res.value;
            res.forEach(function (element) {
                // find time
                let currentTime = element.time;
                if (currentTime == time) {
                    element.value.bodyTemparature = request.body.bodyTemparature;
                    // element.value.bloodPresure.diastolic = request.body.diastolic;
                    // element.value.bloodPresure.systolic = request.body.systolic;
                    // element.value.bloodPresure.pulse = request.body.pulse;
                    // element.value.EMG = request.body.EMG;
                }

            });
            res.save(function (error, result) {
                if (error) {
                    details.error = true;
                    details.message = `Sensor value not updated.`;
                    response.status(404).json(details);
                } else if (result) {
                    details.error = false;
                    details.Details = result;
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
