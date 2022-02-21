const gamelle = require('./models/models.js');
const tasks = require("./cron.js");


//TODO: il faut que à chaque fois que l'on passe heure dans le json, il soit de la forme
//12:30 pour ensuite convertir via une fonction qui va retourner un string 
//utilisable par le crontab


module.exports = {
    /**
    * Fonction permettant de savoir si la gamelle est présente ou non dans la bdd
    * @param data : data dans le corps de la requête
    */
    check: (data, ws) => {
        return gamelle.findOne({ id: data.id })
            .then(async g => {
                if (g === null) await creerGamelle(data, ws);
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
        return g.save().then(g => addMeal(data, ws));
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
                        console.log(tasks.crontabs[i]);
                        tasks.crontabs.splice(i, 1);
                        //tasks.addCrontab("",)
                        //TODO:il faut ajout le crontab
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
                tasks.addCrontab("* * * * *", data.id, lastId, () => console.log("gamelle : " + data.id + " repasId : " + lastId));
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
                    if (c.id == data.id && c.repasId == data.repasId) tasks.crontabs.splice(i, 1);
                });
                ws.send(JSON.stringify(json));
            })
            .catch(e => error(e, ws));
    },
    /**
     * Fonction permettant de dire à a gamelle qu'il faut donner une portion de nourriture
     * FIXME: refaire la fonction
     */
    distribution: async (ws, poids) => {
        //cette fonction sera appelé par le node-cron donc on est censé savoir de quel repas et quel gamelle il s'agit
        let manger = { heure: Date(), poids: poids };
        await gamelle.updateOne({ id: ws.id }, { $push: { historique: manger } });
        ws.send(JSON.stringify({
            action: "manger",
            poids: poids
        }));
        gamelle.findOne({ id: ws.id }).then(g => console.log(g));
    }
}




function error(e, ws) {
    console.log(e);
    ws.send(JSON.stringify({ "status": "error" }));
}
