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

        var repas;
        await this.nextMeal(data, ws, false).then(r => repas = r);

        var g = await gamelle.findOne({ id: data.id });
        if (g.repas.length < 6) {
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


                    this.nextMeal(data, ws, false).then(r => {
                        console.log(repas);
                        if (repas !== undefined)
                            if ((r.heure != repas.heure) || (r.poids != repas.poids)) ws.send(JSON.stringify({ action: "newNextMeal", repas: r }))
                    })
                    //{action:"newNextMeal",repas:}
                })
                .catch(e => error(e, ws));
        } else {
            ws.send(JSON.stringify({ message: "nombre de repas trop élevé" }));
            return false;
        }

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

    /**
     * Fonction permettant de récupérer le prochain repas d'une gamelle selon son id
     * @param data : json {id} 
     * @param ws : client 
     * @param send : boolean : définit  s'il faut envoyer le message ou pas (pour utiliser la fonction dans les autres)
     * @returns promise
     */
    //FIXME: ne fonctionne pas si l'heure la plus proche est au lendemain 
    nextMeal: (data, ws, send = true) => gamelle.findOne(
        { id: data.id })
        .then(g => {
            if (g.repas.length > 0) {
                const now = new Date();
                const heureNow = parseInt(now.getHours());
                const minuteNow = parseInt(now.getMinutes());
                let index = 0;
                let heureMin = 25
                let minuteMin = 60
                g.repas.forEach((r, i) => {
                    let heure = parseInt(r.heure.split(":")[0]);
                    let minute = parseInt(r.heure.split(":")[1]);
                    if (heure >= heureNow) {
                        let flag = false;
                        if (heure == heureNow && minute > minuteNow) flag = true;
                        else if (heure > heureNow) flag = true;
                        if (flag) {
                            if (heure <= heureMin) {
                                let flag = false;
                                if (heure === heureMin && minute < minuteMin) flag = true;
                                else if (heure < heureMin) flag = true;
                                if (flag) {
                                    heureMin = heure;
                                    minuteMin = minute;
                                    index = i;
                                }
                            }
                        }
                    }
                })
                if (send) ws.send(JSON.stringify(g.repas[index]));
                else return g.repas[index];

            } else {
                if (send) ws.send(JSON.stringify({ message: "pas de repas disponible" }));
                else return undefined;
            }

        }),

    /**
     * Fonction permettant de donner à manger maintenant (fait côté client, on sauvegarde juste dans l'historique)
     * @param data : json {id,poids} 
     * @param ws : client 
     * @returns promise
     */
    //fonctionne
    eatNow: (data, ws) => gamelle.findOne(
        { id: data.id })
        .then(async g => {
            if (g.historique.length == 0) lastId = 0;
            else lastId = parseInt(g.historique[g.historique.length - 1].id);
            const now = new Date();
            const heureNow = parseInt(now.getHours());
            const minuteNow = parseInt(now.getMinutes());
            const heure = heureNow + ":" + minuteNow;
            await gamelle.updateOne({ id: data.id }, { $push: { historique: { id: ++lastId, heure: heure, poids: data.poids } } });
            ws.send(JSON.stringify({
                message: "repas ajouté !"
            }));
        })
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
    console.log("distribution");
    var g = await gamelle.findOne({ id: data.id });
    if (g.historique.length == 0) lastId = 0;
    else lastId = parseInt(g.historique[g.historique.length - 1].id);
    await gamelle.updateOne({ id: data.id }, { $push: { historique: { id: ++lastId, heure: data.heure, poids: data.poids } } });
    ws.send(JSON.stringify({
        action: "eatNow",
        poids: data.poids
    }));
}