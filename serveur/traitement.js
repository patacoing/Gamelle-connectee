const gamelle = require('./models/models.js');
const tasks = require("./cron.js");

module.exports = {
    /**
     * Fonction permettant de savoir si la gamelle est présente ou non dans la bdd
     * @param data : data dans le corps de la requête
     */
    //fonctionne
    check: function (data, ws) {
        if (data.id === undefined) {
            error("id manquant", ws);
            return false;
        }
        return gamelle.findOne({ id: data.id })
            .then(async g => {
                if (g === null) await this.creerGamelle(data, ws);
                else {
                    console.log("trouvé!");
                };
            })
            .catch(e => error(e, ws));
    },
    /**
    * Fonction permettant de créer une gamelle dans la bdd
    * @param data : data passée dans la requête 
    */
    //fonctionne
    creerGamelle: function (data, ws) {
        g = new gamelle({
            id: data.id,
        })
        return g.save();
    },
    /**
     * Fonction renvoyant son objet à la gamelle
     * @param currentId : id de la gamelle
     * @param ws : client 
     */
    //fonctionne
    sendData: (currentId, ws) => gamelle.findOne({ id: currentId })
        .then(g => ws.send(JSON.stringify(g)))
        .catch(e => error(e, ws)),

    /**
     * fonction pour modifier les paramètres de la gamelle : heure de distribution et poids
     * @param data: json {id,repasId,heure,poids}
     * @param ws : client 
     */
    //fonctionne
    update: (data, ws) => {
        console.log("update");
        gamelle.updateOne(
            { id: data.id, "repas.id": data.repasId },
            { $set: { "repas.$.heure": data.heure, "repas.$.poids": data.poids } })
            .then(async g => {
                let test = await tasks.updateCrontab(tasks.heureCron(data.heure), data.id, data.repasId, () => {
                    distribution(data, ws);
                });
                if (test === false) {
                    json = { status: "error" };
                } else {
                    json = g.matchedCount == 0 ? { status: "error" } : { status: "updated" };
                }
                ws.send(JSON.stringify(json));
            })
            .catch(e => error(e, ws));
    },
    /**
     * Fonction permettant d'ajouter un repas à une gamelle
     * @param data : json {id,heure,poids}
     * @param ws : client 
     * @returns promise
     */
    //fonctionne
    addMeal: async function (data, ws) {
        if (data.id === undefined || data.heure === undefined || data.poids === undefined) {
            error("champs manquants", ws);
            return false;
        }
        var g = await gamelle.findOne({ id: data.id });
        lastId = g.repas.length == 0 ? 0 : parseInt(g.repas[g.repas.length - 1].id);
        return gamelle.updateOne(
            { id: data.id },
            { $push: { repas: { id: ++lastId, heure: data.heure, poids: data.poids } } })
            .then(g => {
                json = g.matchedCount == 0 ? { status: "error" } : { status: "meal added" };
                tasks.addCrontab(tasks.heureCron(data.heure), data.id, lastId, () => {
                    distribution(data, ws)
                });
                ws.send(JSON.stringify(json));
            })
            .catch(e => error(e, ws));
    },
    /**
     * Fonction permettant de supprimer un repas d'une gamelle selon l'id de la gamelle et l'id du repas
     * @param data : json {id,repasId}
     * @param ws : client
     * @returns promise
     */
    //fonctionne
    deleteMeal: (data, ws) => gamelle.updateOne(
        { id: data.id },
        { $pull: { repas: { id: data.repasId } } })
        .then(g => {
            json = g.modifiedCount == 0 ? { status: "error" } : { status: "deleted" };
            if (!tasks.deleteCrontab(data.id, data.repasId)) error("erreur", ws);
            else ws.send(JSON.stringify(json));
        })
        .catch(e => error(e, ws)),
}

/**
 * Fonction permettant de renvoyer une erreur au client
 * @param e : message de l'erreur 
 * @param ws : client 
 */
function error(e, ws) {
    console.log(e);
    ws.send(JSON.stringify({ "status": "error" }));
}


/**
 * Fonction permettant de dire à a gamelle qu'il faut donner une portion de nourriture
 * Fonction appelé par node-cron
 * @param ws : client
 * @param data : json {id, heure,poids}
 */
//fonctionne
async function distribution(data, ws) {
    var g = await gamelle.findOne({ id: data.id });
    if (g.historique.length == 0) lastId = 0;
    else lastId = parseInt(g.historique[g.historique.length - 1].id);
    await gamelle.updateOne({ id: data.id }, { $push: { historique: { id: ++lastId, heure: data.heure, poids: data.poids } } });
    ws.send(JSON.stringify({
        action: "manger",
        poids: data.poids
    }), (e) => console.log(e));
}