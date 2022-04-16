const WebSocket = require('ws');
const gamelle = require('./models/models.js');
const wss = new WebSocket.Server({ port: 8100 });
const tasks = require("./cron.js");
const action = require("./traitement.js");

wss.on('connection', function connection(ws) {
    var firstMessage = true;
    console.log("connecté !");
    ws.on('message', async function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        let dataJson = JSON.parse(message);
        ws.id = dataJson.id; //on ajoute un id pour chaque client et pour pouvoir les référencer
        if (firstMessage) {
            await gamelle.findOne({ id: dataJson.id })
                .then(g => {
                    if (g != null) {
                        tasks.pushInCrontabs(g, ws); //si on trouve la gamelle, on ajoute ses repas aux crontabs
                    }
                    firstMessage = false;
                });
        }
        traitement(dataJson, ws);
    });
    //TODO: faire un genre de ping qui permettra de savoir si un arduino s'est déco => on lui retire ses crontabs
    //car si on coupe l'alim de l'arduino, l'event close n'est pas activé => les crontabs ne sont pas supprimés
    // ws.on("close", function close() {
    //     console.log("déco !");
    //     console.log(ws.readyState);
    //     deconnection();
    // })
    // setInterval(() => {
    //     if (!ws.isAlive) deconnection();
    //     else ws.isAlive = false;
    // }, 30000);

    // function deconnection() {
    //     var tab = tasks.getCrontab(ws.id);
    //     var k = 0
    //     for (let i = 0; i < tab.length; i++) {
    //         tasks.crontabs.splice(tab[i - k++], 1);
    //     }
    // }

    ws.on("error", function error(e) {
        console.log(e);
    })
});

//setInterval(() => console.log("taille : " + tasks.crontabs.length), 500);

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
            break;
        case "nextMeal":
            action.nextMeal(data, ws);
            break;
        case "eatNow":
            action.eatNow(data, ws);
            break;
        default:
            break;
    }
}







