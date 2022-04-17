const nodeCron = require("node-cron");
const cron = require("./models/modelCron.js");
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
     * Fonction permettant d'ajouter un crontab
     * @param syntaxe : syntaxe crontab 
     * @param id : id gamelle 
     * @param repasId : id repas 
     * @param callback : fonction à executer
     * @returns boolean : true si à fonctionner, false si la syntaxe n'est pas bonne
     */
    //fonctionne
    addCrontab: async (syntaxe, id, repasId, callback) => {
        console.log("addCrontab");
        if (!nodeCron.validate(syntaxe)) return false;
        var cr = nodeCron.schedule(syntaxe, callback);
        cr.id = id;
        cr.repasId = repasId;
        var c = new cron({
            id: id,
            repasId: repasId,
            syntaxe: syntaxe,
        });
        await c.save();
        crontabs.push(cr);
        return true;
    },
    /**
     * Fonction permettant d'ajouter les crontabs d'une gamelle lors de son premier message
     * @param data json{} 
     * @param ws : client 
     */
    pushInCrontabs: function (data, ws) {
        data.repas.forEach((r, i) => {
            var heure = this.heureCron(r.heure);
            if (!nodeCron.validate(heure)) return false;
            var cr = nodeCron.schedule(heure, () => distribution(data, ws))
            cr.id = data.id;
            cr.repasId = r.id;
            crontabs.push(cr);
        });
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
    deleteCrontab: async function (id, repasId) {
        var o = this.getCrontab(id, repasId);
        var index = o.index;
        console.log("index : " + index);
        if (index == -1) return false;
        crontabs[index].stop();
        crontabs.splice(index, 1);
        var res = await cron.deleteOne({ id: id, repasId: repasId });
        return res.ok === 1 ? true : false;
    },
    /**
     * Fonction permettant de modifier un crontab
     * @param heure : heure du cron 
     * @param id : id de la gamelle 
     * @param repasId : id du repas 
     * @param callback : fonction 
     */

    //fonctionne
    updateCrontab: async function (heure, id, repasId, callback) {
        console.log("updateContrab");
        let res = this.getCrontab(id, repasId);
        crontab = res.crontab;
        index = res.index;
        if (crontab === undefined) return false;
        crontab.stop();
        crontabs.splice(index, 1);
        await this.addCrontab(heure, id, repasId, callback);
    }, crontabs
}