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
mongoose.connect('mongodb://test:password@ds211558.mlab.com:11558/ionic_chat');

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
    let status;

    client.on("start", function (data) {
		console.log("Status from frontend :",data.status);
        status = data.status;
        console.log("status :",status);
        /**Body Temparature Measurement
         * Taking 200 as input from frontend 
         */
        if (status == "temperature") {
            var buffer = new Buffer(1);
            console.log(buffer);
            buffer.writeInt8(1);
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
		console.log("Data from arduino :",data);
        client.emit('value',
         { "value": data, "status":status });
    });
});

/**Routings */

/**Store user informations */
app.post('/userRegistration', function (request, response) {
    let userDetails = {};
    console.log("User data :");
    console.log(request.body);
    User.find({ id: request.body.id }, function (error, res) {
			if (error) {
				userDetails.error = true;
				userDetails.message = `User not saved.`;
				response.status(404).json(userDetails);
			} else if (res) {
				
				if(res.length==0){
				
				        let data = new User();
						data.name = request.body.name;
						data.email = request.body.email;
						data.id = request.body.id;
						data.loginTime = request.body.loginTime;
						data.value.push({time:request.body.time})

							data.save(function (error, result) {
								
								if (error) {
									userDetails.error = true;
									userDetails.message = `User details not saved.`;
									response.status(404).json(userDetails);
								} else if (result) {
									console.log(result);
									userDetails.error = false;
									userDetails.userDetails = result;
									userDetails.message = `User Details.`;
									response.status(200).json(userDetails);
								}
								
						  });
						
				}else{
					
					res[0].value.push({time:request.body.time})
					res[0].loginTime = request.body.loginTime;
					
					       res[0].save(function (error, result) {
							   
								if (error) {
									userDetails.error = true;
									userDetails.message = `User details not saved.`;
									response.status(404).json(userDetails);
								} else if (result) {
									console.log(result);
									userDetails.error = false;
									userDetails.userDetails = result;
									userDetails.message = `User Details.`;
									response.status(200).json(userDetails);
								}
								
						  });

						 
			    }
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
    let bodyTemparature=request.body.bodyTemparature;
    let tempId=request.body.tempId;
    console.log("sensor values :");
    console.log(request.body);
    
    User.find({id:request.body.id}).then(function(result){
			for(let i in result){
					let ro=result[i];
					
					console.log("ro :",ro);
					
					ro.value.forEach(function(element){
						console.log("element :",element);
						
						let currentTime=element.time;
						
						if(time==currentTime){
							
							element.data.forEach(function(res){
								console.log("res is is :",res);
								
									if(res._id==tempId){
										
									res.remove();
									
									}
		
								});
								
								element.data.push({bodyTemparature:bodyTemparature});	
							
							console.log("element.data :",element.data);
							}
						});
						
						ro.save( (error, result)=> {
								if (error) {
									details.error = true;
									details.message = `Sensor value not updated.`;
									response.status(404).json(details);
								} else if (result) {
									console.log("result is :",result);
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
