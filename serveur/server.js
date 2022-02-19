

const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 8100 });

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

/**
 * Fonction de traitement de la requête
 * @param  data : data passé dans le corps de la requête
 * @param ws : client 
 */
async function traitement(data, ws) {
    await check(data);
    switch (data.action) {
        case "requestData":
            sendData(data.id, ws);
            break;
        case "update":
            update(data, ws);
            break;
        case "deleteMeal":
            deleteMeal(data, ws);
            break;
        default:
            break;
    }
}

/**
 * Fonction permettant de savoir si la gamelle est présente ou non dans la bdd
 * @param data : data dans le corps de la requête
 */
function check(data) {
    return gamelle.findOne({ id: data.id })
        .then(async g => {
            if (g === null) await creerGamelle(data);
            else console.log("trouvé !");
        })
        .catch(e => console.log(e));
}

/**
 * Fonction permettant de créer une gamelle dans la bdd
 * @param data : data passée dans la requête 
 */
function creerGamelle(data) {
    g = new gamelle({
        id: data.id,
        repas: [{ id: 1, heure: Date(), poids: 50 }]
    })
    return g.save();
}

/**
 * Fonction renvoyant son objet à la gamelle
 * @param currentId : id de la gamelle
 * @param ws : client 
 */
function sendData(currentId, ws) {
    return gamelle.findOne({ id: currentId })
        .then(g => ws.send(JSON.stringify(g)));
}

/**
 * fonction pour modifier les paramètres de la gamelle : heure de distribution et poids
 * @param data: json 
 * @param ws : client 
 */
//TODO: il faut modifier le crontab associé
function update(data, ws) {
    gamelle.updateOne(
        { id: data.id, "repas.id": data.repasId },
        { $set: { "repas.$.heure": data.heure, "repas.$.poids": data.poids } })
        .then(g => {
            json = g.matchedCount == 0 ? { status: "error" } : { status: "updated" };
            ws.send(JSON.stringify(json));
        })
        .catch(e => error(e, ws));
}

/**
 * Fonction permettant de supprimer un repas d'une gamelle selon l'id de la gamelle et l'id du repas
 * @param data : json 
 * @param ws : client
 */
//TODO: il faut supprimer le crontab associé
function deleteMeal(data, ws) {
    gamelle.updateOne(
        { id: data.id },
        { $pull: { repas: { id: data.repasId } } })
        .then(g => {
            json = g.matchedCount == 0 ? { status: "error" } : { status: "deleted" };
            ws.send(JSON.stringify(json));
        })
        .catch(e => error(e, ws));
}

function error(e, ws) {
    console.log(e);
    ws.send(JSON.stringify({ "status": "error" }));
}


//TODO: dès qu'une gamelle est créée, il faut faire un nouveau node-cron avec l'heure spécifiée
//si on rajoute un repas à une gamelle, il faut faire un node-cron


/**
 * Fonction permettant de dire à a gamelle qu'il faut donner une portion de nourriture
 * Chaque gamelle aura un node-cron pour chacun de ses repas
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