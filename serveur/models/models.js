const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017');
const gamelle = mongoose.Schema({
    id: { type: String, required: true },
    repas: [{ id: { type: String, required: true }, heure: { type: Date, required: true }, poids: { type: Number, required: true } }],
    historique: [{ id: { type: String, required: true }, heure: { type: Date, required: true }, poids: { type: Number, required: true } }]
});

module.exports = mongoose.model('gamelle', gamelle);