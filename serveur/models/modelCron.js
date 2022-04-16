const mongoose = require('mongoose');

var str;
if (process.env.PRODUCTION == "true") str = "mongodb://pind:pind@mongodb:27017";
else str = "mongodb://127.0.0.1:27017";

mongoose.connect(str);
const cron = mongoose.Schema({
    syntaxe: { type: String, required: true },
    id: { type: String, required: true },
    repasId: { type: String, required: true }
});

module.exports = mongoose.model('cron', cron);