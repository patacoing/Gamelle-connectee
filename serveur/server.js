

const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 80 });

wss.on('connection', function connection(ws) {
    console.log("connecté !");
    ws.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        console.log(message);
        let dataJson = JSON.parse(message);
        ws.id = dataJson.id; //on ajoute un id pour chaque client et pour pouvoir les référencer
        console.log("ID  = " + dataJson.id);
        console.log("ACTION = " + dataJson.action);
        traitement(dataJson, ws);

    });


});

function traitement(data, ws) {
    if (data.action == "requestData") {
        check(data);
        sendData(data.id, ws);
    }
    if (data.action == "modification") {
        miseAJour(data);
    }

}

function check(data) {
    gamelle.findOne({ id: data.id })
        .then()
        .catch(creerGamelle(data));
}
function creerGamelle(data) {
    g = new gamelle({
        id: data.id,
        poids: 50
    })
    g.save();
}

function sendData(currentId, ws) {
    gamelle.findOne({ id: currentId }).
        then(g => {
            let json = { poids: g.poids };
            console.log(json.poids, json.id)
            ws.send(JSON.stringify(json));
        }
        );
}

function miseAJour(data) {
    gamelle.updateOne({ id: data.id }, { ...data, id: data.id })
        .then(g => {
            reponse = { "status": "modifie" }
            console.log(reponse);
        })

        .catch(() => {
            creerGamelle(data);
            reponse = { "status": "nouveau" };
            console.log(reponse);
        });
}