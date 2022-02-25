const gamelle = require('./models/models.js');
const tasks = require("./cron.js");

var action = {
    /**
   * Fonction permettant de savoir si la gamelle est présente ou non dans la bdd
   * @param data : data dans le corps de la requête
   */
    check: (data, ws) => {
        if (data.id === undefined) {
            error("id manquant", ws);
            return false;
        }
        return gamelle.findOne({ id: data.id })
            .then(async g => {
                if (g === null) await action.creerGamelle(data, ws);
                else console.log("trouvé !");
            })
            .catch(e => error(e, ws));
    },
    /**
    * Fonction permettant de créer une gamelle dans la bdd
    * @param data : data passée dans la requête 
    */
    creerGamelle: (data, ws) => {
        g = new gamelle({
            id: data.id,
        })
        return g.save().then(g => action.addMeal(data, ws));
    },
    /**
     * Fonction renvoyant son objet à la gamelle
     * @param currentId : id de la gamelle
     * @param ws : client 
     */
    sendData: (currentId, ws) => {
        return gamelle.findOne({ id: currentId })
            .then(g => ws.send(JSON.stringify(g)))
            .catch(e => error(e, ws));
    },
    /**
     * fonction pour modifier les paramètres de la gamelle : heure de distribution et poids
     * @param data: json {id,repasId,heure,poids}
     * @param ws : client 
     */
    update: (data, ws) => {
        gamelle.updateOne(
            { id: data.id, "repas.id": data.repasId },
            { $set: { "repas.$.heure": data.heure, "repas.$.poids": data.poids } })
            .then(g => {
                tasks.crontabs.forEach((c, i) => {
                    if (c.id == data.id && c.repasId == data.repasId) {
                        c.stop();
                        tasks.crontabs.splice(i, 1);
                        tasks.addCrontab(heureCron(data.heure), data.id, data.repasId, () => action.distribution(data, ws));

                    }
                });
                json = g.matchedCount == 0 ? { status: "error" } : { status: "updated" };
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
    addMeal: async (data, ws) => {
        if (data.id === undefined || data.heure === undefined || data.poids === undefined) {
            error("champs manquants", ws);
            return false;
        }
        var g = await gamelle.findOne({ id: data.id });
        if (g.repas.length == 0) lastId = 0;
        else lastId = parseInt(g.repas[g.repas.length - 1].id);
        return gamelle.updateOne(
            { id: data.id },
            { $push: { repas: { id: ++lastId, heure: data.heure, poids: data.poids } } })
            .then(g => {
                json = g.matchedCount == 0 ? { status: "error" } : { status: "meal added" };
                tasks.addCrontab(heureCron(data.heure), data.id, lastId, () => action.distribution(data, ws));
                console.log("depuis traitement :" + tasks.crontabs + "."); //FIXME:pour débugguer
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
    deleteMeal: (data, ws) => {
        return gamelle.updateOne(
            { id: data.id },
            { $pull: { repas: { id: data.repasId } } })
            .then(g => {
                json = g.modifiedCount == 0 ? { status: "error" } : { status: "deleted" };
                tasks.crontabs.forEach((c, i) => {
                    if (c.id == data.id && c.repasId == data.repasId) {
                        c.stop();
                        tasks.crontabs.splice(i, 1);
                    }
                });
                ws.send(JSON.stringify(json));
            })
            .catch(e => error(e, ws));
    },
    /**
     * Fonction permettant de dire à a gamelle qu'il faut donner une portion de nourriture
     * Fonction appelé par node-cron
     * @param ws : client
     * @param data : json {id, heure,poids}
     */
    distribution: async (data, ws) => {
        //cette fonction sera appelé par le node-cron donc on est censé savoir de quel repas et quel gamelle il s'agit
        var g = await gamelle.findOne({ id: data.id });
        if (g.historique.length == 0) lastId = 0;
        else lastId = parseInt(g.historique[g.historique.length - 1].id);
        time = data.heure.split(" ");
        h = time[2] + ":" + time[1];
        let manger = { id: ++lastId, heure: h, poids: data.poids };
        await gamelle.updateOne({ id: data.id }, { $push: { historique: manger } }); //FIXME: ne fonctionne pas
        ws.send(JSON.stringify({
            action: "manger",
            poids: data.poids
        }));
    }
}


module.exports = {
    action
}

/**
 * Fonction permettant de transformer l'heure HH:MM sour format crontab
 * par défaut l'heure est 10h00, si l'argument est mal fournit, l'heure devient 10h00
 * @param heure : format HH:MM
 * @returns : syntaxe sous forme de crontab  
 */
function heureCron(heure = "10:00") {
    let tab = heure.split(':');
    if (tab.length < 1) tab = [10, 10];
    return "0 " + tab[1] + " " + tab[0] + " * * *";
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
