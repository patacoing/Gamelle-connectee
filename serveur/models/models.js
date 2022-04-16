const mongoose = require('mongoose');

var str;
if (process.env.PRODUCTION == "true") str = "mongodb://pind:pind@mongodb:27017";
else str = "mongodb://127.0.0.1:27017";
console.log(str);
mongoose.connect(str);
const gamelle = mongoose.Schema({
    id: { type: String, required: true },
    repas: [{ id: { type: String, required: true }, heure: { type: String, required: true }, poids: { type: Number, required: true } }],
    historique: [{ id: { type: String, required: true }, heure: { type: String, required: true }, poids: { type: Number, required: true } }]
});

module.exports = mongoose.model('gamelle', gamelle);