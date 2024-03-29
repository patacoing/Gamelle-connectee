const gamelle = require('./models/models.js');
const tasks = require("./cron.js");



/**
 * Tableau sous forme {id,ws}
 * recense les gamelles
 */
var clients = new Array();;

/**
 * Fonction lancée au démarrage/redémarrage du serveur, elle permet de lancer des crontabs pour chaque
 * repas de chaque gamelle, sans que ceux-ci ne fassent quelquechose ainsi
 * les repas sont rattribué de façon normal dès la reconnexion des gamelles au fur et à mesure
 */
//fonctionne
function restartServer() {
    return gamelle.find()
        .then(gamelles => gamelles.forEach(g => {
            let id = g.id;
            g.repas.forEach(r => {
                tasks.addCrontab({ id: id, repasId: r.id, heure: r.heure, poids: r.poids }, () => { });
            })
        }))
}

/**
 * Fonction permettant de savoir si la gamelle est présente ou non dans la bdd
 * @param data : data dans le corps de la requête
 */
//fonctionne
function check(data, ws) {
    if (data.id === undefined) {
        error("* check - id manquant");
        return false;
    }
    return gamelle.findOne({ id: data.id })
        .then(async g => {
            if (g === null) await creerGamelle(data, ws);
            else console.log("* check - trouvé!");
        })
        .catch(e => error("* check - " + e));
}

/**
* Fonction permettant de créer une gamelle dans la bdd
* @param data : data passée dans la requête 
*/
//fonctionne
function creerGamelle(data) {
    g = new gamelle({
        id: data.id,
    })
    return g.save();
}

/**
 * Fonction renvoyant son objet à la gamelle
 * @param currentId : id de la gamelle
 * @param ws : client 
 */
//fonctionne
function requestData(currentId, ws) {
    return gamelle.findOne({ id: currentId }).select("-historique")
        .then(g => ws.send(JSON.stringify(g)))
        .catch(e => error("* requestData - " + e))
}

/**
 * fonction pour modifier les paramètres de la gamelle : heure de distribution et poids
 * @param data: json {id,repasId,heure,poids}
 * @param ws : client 
 */
//fonctionne
async function update(data, ws) {
    ws = isArduino(ws, data.id);
    if (ws === false) return;
    var repas;
    await nextMeal(data, ws, false).then(r => repas = r);
    return gamelle.updateOne(
        { id: data.id, "repas.id": data.repasId },
        { $set: { "repas.$.heure": data.heure, "repas.$.poids": data.poids } })
        .then(async g => {
            let test = tasks.updateCrontab(data, () => distribution(data, ws));
            console.log("test = " + test);
            if (test !== false) {
                nextMeal(data, ws, false).then(r => {
                    if ((r.heure != repas.heure) || (r.poids != repas.poids))
                        ws.send(JSON.stringify({ action: "newNextMeal", repas: r }))
                })
            }

        })
        .catch(e => error("* update - " + e));
}

/**
 * Fonctionne permettant de renvoyer l'objet websocket si l'on est une gamelle ou l'on provient de l'appli web
 * @param ws : client 
 * @param id : id de la gamelle 
 * @returns objet websocket à lequel envoyer la donnée
 */
function isArduino(ws, id) {
    if (!ws.isArduino) {
        c = clients.find(c => c.id === id);
        if (c === undefined) {
            return false;
        } else return c.ws;
    } else return ws;
}

/**
 * Fonction permettant d'ajouter un repas à une gamelle
 * @param data : json {id,heure,poids}
 * @param ws : client 
 * @returns promise
 */
//fonctionne
async function addMeal(data, ws) {
    if (data.id === undefined || data.heure === undefined || data.poids === undefined) {
        error("* addMeal - champs manquants");
        return false;
    }
    ws = isArduino(ws, data.id);
    if (ws === false) return;
    var repas;
    await nextMeal(data, ws, false).then(r => repas = r);
    var g = await gamelle.findOne({ id: data.id });
    if (g.repas.length < 6) {
        lastId = g.repas.length == 0 ? 0 : parseInt(g.repas[g.repas.length - 1].id);
        return gamelle.updateOne(
            { id: data.id },
            { $push: { repas: { id: ++lastId, heure: data.heure, poids: data.poids } } })
            .then(g => {
                data.repasId = lastId;
                tasks.addCrontab(data, () => distribution(data, ws));
                nextMeal(data, ws, false).then(r => {
                    console.log(r);
                    if (repas !== undefined) {
                        if ((r.heure != repas.heure) || (r.poids != repas.poids)) ws.send(JSON.stringify({ action: "newNextMeal", repas: r }))
                    } else ws.send(JSON.stringify({ action: "newNextMeal", repas: r }));
                })
            })
            .catch(e => error("* addMeal - " + e));
    } else {
        ws.send(JSON.stringify({ message: "nombre de repas trop élevé" }));
        return false;
    }
}

/**
 * Fonction permettant de réattribuer les repas à une gamelle venant de se reconnecter
 * @param indexCron : tableau de json {id,repasId}
 * @param ws : client 
*/
//fonctionne
function restartCrontabs(indexCron, ws) {
    indexCron.forEach(i => {
        let cr = tasks.crontabs.find(e => e.id === i.id && e.repasId === i.repasId);
        let data = {
            id: cr.id,
            repasId: cr.repasId,
            heure: cr.heure,
            poids: cr.poids
        }
        tasks.deleteCrontab(data.id, data.repasId);
        tasks.addCrontab(data, () => distribution(data, ws));
    });
}

/**
 * Fonction permettant de supprimer un repas d'une gamelle selon l'id de la gamelle et l'id du repas
 * @param data : json {id,repasId}
 * @param ws : client
 * @returns promise
 */
//fonctionne
async function deleteMeal(data, ws) {
    console.log("* deleteMeal");
    ws = isArduino(ws, data.id);
    if (ws === false) return;
    var repas;
    await nextMeal(data, ws, false).then(r => repas = r);
    return gamelle.updateOne(
        { id: data.id },
        { $pull: { repas: { id: data.repasId } } })
        .then(info => {
            if (info.modifiedCount != 0) gamelle.findOne({ id: data.id })
                .then(async g => {
                    console.log("* deleteMeal - update dans la bdd00");
                    let res = tasks.deleteCrontab(data.id, data.repasId);
                    console.log(res);
                    nextMeal(data, ws, false).then(r => {
                        if (r == undefined) //cas où les repas sont vides
                            ws.send(JSON.stringify({ action: "newNextMeal", repas: { heure: -1, poids: -1 } }));
                        else if (repas !== undefined)
                            if ((r.heure != repas.heure) || (r.poids != repas.poids)) ws.send(JSON.stringify({ action: "newNextMeal", repas: r }))
                    })
                })
        })
        .catch(e => error("* deleteMeal - " + e))
}

/**
 * Fonction permettant de récupérer le prochain repas d'une gamelle selon son id
 * @param data : json {id} 
 * @param ws : client 
 * @param send : boolean : définit  s'il faut envoyer le message ou pas (pour utiliser la fonction dans les autres)
 * @returns promise
 */
//fonctionne
function nextMeal(data, ws, send = true) {
    return gamelle.findOne(
        { id: data.id })
        .then(g => {
            if (g.repas.length > 0) {
                const now = new Date();
                const heureNow = parseInt(now.getHours());
                const minuteNow = parseInt(now.getMinutes());
                let index = -1;
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
                console.log("* nextMeal - " + heureMin + "h " + minuteMin + "m index : " + index);
                if (index == -1) { //cas où le plus proche est le lendemain
                    let r = g.repas.reduce((r1, r2) => {
                        let h1 = r1.heure.split(":")[0];
                        let m1 = r1.heure.split(":")[1];
                        let h2 = r2.heure.split(":")[0];
                        let m2 = r2.heure.split(":")[1];
                        if (h1 <= h2) {
                            if (h1 == h2) {
                                return (m1 < m2) ? r1 : r2;
                            } else return r1
                        } else return r2;
                    });
                    index = g.repas.indexOf(r);
                }
                if (send) ws.send(JSON.stringify({ action: "newNextMeal", repas: g.repas[index] }));
                else return g.repas[index];

            } else {
                if (send) ws.send(JSON.stringify({ action: "newNextMeal", repas: { heure: -1, poids: -1 } }));
                else return undefined;
            }
        })
}

/**
 * Fonction permettant de donner à manger maintenant (fait côté client, on sauvegarde juste dans l'historique)
 * @param data : json {id,poids} 
 * @param ws : client 
 * @returns promise
 */
//fonctionne
function eatNow(data, ws) {
    return gamelle.findOne(
        { id: data.id })
        .then(async g => {
            let lastId = g.historique.length == 0 ? 0 : g.historique[g.historique.length - 1].id;
            const now = new Date();
            const heureNow = parseInt(now.getHours());
            const minuteNow = parseInt(now.getMinutes());
            const heure = heureNow + ":" + minuteNow;
            await gamelle.updateOne({ id: data.id }, { $push: { historique: { id: ++lastId, heure: heure, poids: data.poids } } });
            console.log("ws.isArduino =" + ws.isArduino);
            if (!ws.isArduino) {
                ws = isArduino(ws, data.id);
                if (ws === false) return;
                distribution(data, ws);
            }
        })
}

/**
 * Fonction permettant de récupérer l'historique des repas d'une gamelle
 * @param data : json{id} 
 * @param ws : client 
 */
//fonctionne
function history(data, ws) {
    return gamelle.findOne(
        { id: data.id })
        .then(g => {
            ws.send(JSON.stringify({ historique: g.historique }));
        })
}

/**
 * Fonction permettant de mettre à jour les clients
 * si c'est une nouvelle gamelle : on l'ajoute, sinon on remplace le ws
 * @param ws : client 
 */
//fonctionne
function updateClients(ws) {
    let index = clients.findIndex(c => c.id === ws.id);
    if (index !== -1) clients[index].ws = ws; //sinon le ws ne sera plus valide après la déconnexion
    else clients.push({ id: ws.id, ws: ws });
}


/**
 * Fonction permettant de dire à a gamelle qu'il faut donner une portion de nourriture
 * Fonction appelé par node-cron
 * @param ws : client
 * @param data : json {id, heure,poids}
 */
//fonctionne
async function distribution(data, ws) {
    console.log("* distribution");
    var g = await gamelle.findOne({ id: data.id });
    let lastId = g.historique.length == 0 ? 0 : g.historique[g.historique.length - 1].id;
    await gamelle.updateOne({ id: data.id }, { $push: { historique: { id: ++lastId, heure: data.heure, poids: data.poids } } });
    ws.send(JSON.stringify({
        action: "eatNow",
        poids: data.poids
    }));
    nextMeal(data, ws);
}

/**
 * Fonction permettant de renvoyer une erreur au client
 * @param e : message de l'erreur 
 * @param ws : client 
 */
function error(e) {
    console.log(e);
}

module.exports = {
    restartServer,
    check,
    requestData,
    update,
    addMeal,
    restartCrontabs,
    deleteMeal,
    nextMeal,
    eatNow,
    history,
    clients,
    updateClients
}





