const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    loginTime: {
        type: String
    },
    id: {
        type: String
    },
    value: [
        {
            time: {
                type: String
            }
        },
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

const User = module.exports = mongoose.model('User', userSchema);
