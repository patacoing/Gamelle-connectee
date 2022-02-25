const nodeCron = require("node-cron");

crontabs = new Array();


module.exports = {
    /**
     * Fonction permettant d'ajouter un crontab
     * @param syntaxe : syntaxe crontab 
     * @param id : id gamelle 
     * @param repasId : id repas 
     * @param callback : fonction à executer
     * @returns boolean : true si à fonctionner, false si la syntaxe n'est pas bonne
     */
    //FIXME:il faut pouvoir utiliser crontabs ici et dans les autres fichiers js
    addCrontab: (syntaxe, id, repasId, callback) => {
        console.log("syntaxe : '" + syntaxe + "'");
        if (!nodeCron.validate(syntaxe)) return false;
        var cron = nodeCron.schedule(syntaxe, callback);
        cron.id = id;
        cron.repasId = repasId;
        crontabs.push(cron);
        console.log("depuis cron \n" + crontabs);
        return true;
    }, crontabs
}