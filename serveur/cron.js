const nodeCron = require("node-cron");
crontabs = new Array();


module.exports = {
    /**
     * Fonction permettant de transformer l'heure HH:MM sour format crontab
     * par défaut l'heure est 10h00, si l'argument est mal fournit, l'heure devient 10h00
     * @param heure : format HH:MM
     * @returns : syntaxe sous forme de crontab  
     */
    //fonctionne
    heureCron: function (heure = "10:00") {
        let tab = heure.split(':');
        if (tab.length < 1) tab = [10, 10];
        return "0 " + tab[1] + " " + tab[0] + " * * *";
    },
    /**
     * Fonction permettant de transformer une syntaxe cron en date au format HH:MM
     * @param syntaxe : date crontab 
     * @returns : heure au format HH:MM
     */
    //fonctionne
    cronHeure: function (syntaxe = "0 10 10 * * *") {
        let tab = syntaxe.split(" ");
        return tab[2] + ":" + tab[1];
    },
    /**
     * Fonction permettant d'ajouter un crontab
     * @param data : json {id,repasId,heure,poids}
     * @returns boolean : true si à fonctionner, false si la syntaxe n'est pas bonne
     */
    //fonctionne
    addCrontab: function (data, callback) {
        console.log("addCrontab");
        let id = data.id;
        let syntaxe = this.heureCron(data.heure);
        console.log("data.repasId = " + data.repasId);
        let repasId = data.repasId;

        if (!nodeCron.validate(syntaxe)) return false;
        var cr = nodeCron.schedule(syntaxe, callback);
        cr.id = id;
        cr.repasId = repasId;
        cr.callback = callback;
        cr.heure = data.heure;
        cr.poids = data.poids;
        crontabs.push(cr);
        return true;
    },
    /**
     * Fonction permettant de récupérer un crontab suivant un id et un repasId
     * @param id : id de la gamelle 
     * @param repasId : id du repas 
     * @returns élément crontab
     */
    //fonctionne
    getCrontab: function (id, repasId) {
        if (repasId === undefined) tab = [];
        for (let i = 0; i < crontabs.length; i++) {
            var c = crontabs[i];
            if (repasId !== undefined && c.id == id && c.repasId == repasId) {
                return { crontab: c, index: i };
            }
            else if (repasId === undefined && c.id == id) {
                tab.push(i);
            }
        }
        if (repasId === undefined) return tab;
        return { cron: undefined, index: -1 };
    },

    /**
     * Fonction permettant de supprimer un crontab suivant un  id et un repasId
     * @param id : id de la gamelle 
     * @param repasId : id du repas
     * @returns : true si la suppression a fonctionné, false sinon
     */
    //fonctionne
    deleteCrontab: function (id, repasId) {
        var o = this.getCrontab(id, repasId);
        console.log("o :" + o);
        var index = o.index;
        console.log("index : " + index);
        if (index == -1) return false;
        crontabs[index].stop();
        crontabs.splice(index, 1);
        return true;
    },
    /**
     * Fonction permettant de modifier un crontab
     * @param data : json {id,repasId,heure,poids}
     * @param callback : fonction 
     */
    //fonctionne
    updateCrontab: function (data, callback) {
        console.log("updateContrab");
        let id = data.id;
        let repasId = data.repasId;
        let res = this.getCrontab(id, repasId);
        crontab = res.crontab;
        index = res.index;
        if (crontab === undefined) return false;
        crontab.stop();
        crontabs.splice(index, 1);
        this.addCrontab(data, callback);
    }, crontabs
}