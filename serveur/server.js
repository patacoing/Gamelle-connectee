const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8100 });
const tasks = require("./cron.js");
const action = require("./traitement.js");


action.restartServer();

wss.on('connection', function connection(ws) {
    var firstMessage = true;
    console.log("connecté !");
    ws.on('message', async function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        let dataJson = JSON.parse(message);
        ws.id = dataJson.id; //on ajoute un id pour chaque client et pour pouvoir les référencer
        dataJson.isArduino === undefined ? ws.isArduino = false : ws.isArduino = true;
        if (firstMessage && ws.isArduino) {
            action.updateClients(ws);
            var gamelleCrontabs = tasks.crontabs.filter(crontab => crontab.id == ws.id).map(crontab => { return { id: crontab.id, repasId: crontab.repasId } });
            action.restartCrontabs(gamelleCrontabs, ws);
            firstMessage = false;
        }
        traitement(dataJson, ws);
    });
});

/**
 * Fonction de traitement de la requête
 * @param  data : data passé dans le corps de la requête
 * @param ws : client 
 */
async function traitement(data, ws) {
    if (data.action.alive) ws.isAlive = true;
    let check = await action.check(data, ws);
    console.log("taille : " + tasks.crontabs.length);
    console.log("action : " + data.action);
    if (check === false) return false;
    switch (data.action) {
        case "requestData":
            action.requestData(data.id, ws);
            break;
        case "update":
            action.update(data, ws);
            break;
        case "deleteMeal":
            action.deleteMeal(data, ws);
            break;
        case "addMeal":
            action.addMeal(data, ws);
            break;
        case "nextMeal":
            action.nextMeal(data, ws);
            break;
        case "eatNow":
            action.eatNow(data, ws);
            break;
        case "history":
            action.history(data, ws);
            break;
        default:
            break;
    }
}







