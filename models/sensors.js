const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const sensorSchema = mongoose.Schema({
    userId: {
        type: String
    },
    value: [
        {
            bodyTemparature: {
                type: String
            }
        },
        {
            bloodPresure: {
                diastolic: {
                    type: String
                },
                systolic: {
                    type: String
                },
                pulse: {
                    type: String
                }
            }
        },
        {
            EMG: {
                type: String
            }
        }
    ]
});

const Sensor = module.exports = mongoose.model('Sensor', sensorSchema);
