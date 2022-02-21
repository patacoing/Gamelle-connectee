const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 8100 });
const tasks = require("./cron.js");
const action = require("./traitement.js");


//TODO: il faut lancer la fonction distribution avec le ws ==> il faut récupérer l'objet
(async function init() {
    const gamelles = await gamelle.find();
    gamelles.forEach(g => {
        g.repas.forEach(repas => {
            tasks.addCrontab("* * * * *", g.id, repas.id, () => console.log("gamelle : " + g.id + " repas : " + repas.id));
        });
    });
})();


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
    await action.check(data);
    switch (data.action) {
        case "requestData":
            action.sendData(data.id, ws);
            break;
        case "update":
            action.update(data, ws);
            break;
        case "deleteMeal":
            action.deleteMeal(data, ws);
            break;
        case "addMeal":
            action.addMeal(data, ws);
        default:
            break;
    }
}







