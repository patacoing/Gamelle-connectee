const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 80 });
var connexion;


wss.on('connection', function connection(ws) {
    console.log("connecté !");
    connexion = 1;
    ws.on('message', function message(data) {
        data = JSON.parse(data);
        console.log("message reçu ! : " + data.id);
        console.log(wss.clients.length)
        wss.clients.forEach(function each(client) {
            console.log("CLIENT ");
            console.log(client.id);
        });
        var json = { "status": "nouveau" };
        ws.send(JSON.stringify(json));
    });


});

function traitement(data) {
    var reponse
    if (connexion == 1) reponse = check(data);
    return JSON.stringify(reponse);
}




function check(data) {
    //connexion = 0;
    var reponse;
    gamelle.findOne({ id: data.id })
        .then(reponse = { "status": "ok" })
        .catch(creerGamelle(data),
            reponse = { "status": "nouveau" });
    return reponse
}
function creerGamelle(data) {
    g = new gamelle({
        id: data.id,
        poids: 50
    })
    g.save();
}