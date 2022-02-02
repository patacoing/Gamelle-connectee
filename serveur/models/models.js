const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017');
const gamelle = mongoose.Schema({
    id: { type: String, required: true },
    poids: { type: Number, required: true },
    heure1: { type: Date, required: false },
    heure2: { type: Date, required: false },
});
const historique = mongoose.Schema({
    id: { type: String, required: true }

})
module.exports = mongoose.model('gamelle', gamelle);