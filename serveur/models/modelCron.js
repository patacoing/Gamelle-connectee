const mongoose = require('mongoose');

//pour le déploiement : mongodb://pind:pind@mongodb:27017

mongoose.connect('mongodb://127.0.0.1:27017');
const cron = mongoose.Schema({
    syntaxe: { type: String, required: true },
    id: { type: String, required: true },
    repasId: { type: String, required: true }
});

module.exports = mongoose.model('cron', cron);