const mongoose = require('mongoose');

mongoose.connect('mongodb://pind:pind@mongodb:27017');
const cron = mongoose.Schema({
    syntaxe: { type: String, required: true },
    id: { type: String, required: true },
    repasId: { type: String, required: true }
});

module.exports = mongoose.model('cron', cron);