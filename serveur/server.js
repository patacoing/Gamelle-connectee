

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
    switch (data.action) {
        case "requestData":
            await check(data);
            console.log("coucou");
            sendData(data.id, ws);

            break;
        case "modification":
            miseAJour(data);
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
        repas: [{ heure: Date(), poids: 50 }]
    })
    return g.save();
}

/**
 * Fonction renvoyant son objet à la gamelle
 * @param currentId : id de la gamelle
 * @param ws : client 
 */
function sendData(currentId, ws) {
    gamelle.findOne({ id: currentId })
        .then(g => ws.send(JSON.stringify(g)));
}

/**
 * fonction pour modifier les paramètres de la gamelle : heure de distribution
 * {
 *  id,heureAvant, heure
 * }
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