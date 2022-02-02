

const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 8100 });


wss.on('connection', function connection(ws) {
    console.log("connecté !");
    ws.on('message', function message(data) {
        data = JSON.parse(data);
        console.log("message reçu ! : " + data);
        ws.id = data.id;
        wss.clients.forEach((client, i) => {
            console.log(i);
        });
        var json = { "status": "nouveau" };
        ws.send(JSON.stringify(json));
        distribution(ws, 500);
    });
});


function traitement(data) {
    var reponse
    reponse = check(data);
    return JSON.stringify(reponse);
}


function check(data) {
    var reponse;
    gamelle.findOne({ id: data.id })
        .then(g => {
            reponse = { "status": "ok" }
            console.log(reponse);
            console.log(g);
            return reponse;
        })
        .catch(() => {
            creerGamelle(data);
            reponse = { "status": "nouveau" }
            console.log(reponse);
            return reponse;
        });
}
function creerGamelle(data) {
    g = new gamelle({
        id: data.id,
        repas: [{ heure: Date(), poids: 0 }]
    })
    g.save().then(() => console.log("objet saved")).catch(e => console.log(e));
}


/**
 * fonction pour modifier les paramètres de la gamelle : heure de distribution
 * @param data: json 
 */
function miseAJour(data) {
    gamelle.updateOne(
        { id: data.id, "repas.heure": data.heureAvant },
        { $set: { id: data.id, "repas.$.heure": data.heure } })
        .then(g => {
            reponse = { "status": "modifie" }
            console.log(reponse);
            return reponse;
        })

        .catch(() => {
            creerGamelle(data);
            reponse = { "status": "nouveau" };
            console.log(reponse);
            return reponse;
        });
}


//TODO: dès qu'une gamelle est créée, il faut faire un nouveau node-cron avec l'heure spécifiée
//si on rajoute un repas à une gamelle, il faut faire un node-cron
//si un repas est supprimé, il faut supprimer le node-cron

/*
console.log("yo");
check({ id: 126644894 });
miseAJour({ id: 126644894, poids: 50 });
check({ id: 126644894 });
*/

/**
 * Chaque gamelle aura un node-cron pour chacune de ses heures
 */
async function distribution(ws, poids) {
    let manger = { heure: Date(), poids: poids };
    await gamelle.updateOne({ id: ws.id }, { $push: { historique: manger } });
    ws.send(JSON.stringify({
        action: "manger",
        poids: poids
    }));
    gamelle.findOne({ id: ws.id }).then(g => console.log(g));
}