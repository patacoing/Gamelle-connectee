const socket = new WebSocket("ws://141.94.203.97:8100");
let id = "";
let updateCreateDistrib;
$(document).ready(() => {
    $("#afterlog").hide();
    $("#corps").hide();
    $("#updateCreateRepas").hide();

});

function showDeconnexion() {
    $("#login").hide();
    $("#afterlog").show();
}

$(document).on("click", "#deconnexion", () => {
    showConnexion();

});


$(document).on("click", "#connexion", () => {
    id = $("#Appairage").val();
    showMenuSelect();
    console.log(socket.isOpen)
    checkWebSocket();

});
$(document).on("click", "#distribuer", () => {
    updateCreateDistrib = -1;
    console.log("distribuer");
    $("#updateCreateRepas").show();
    $("#creationRepas").val("distribuer");
    $("#divHeure").hide();
    $("#poids").val(0);

});
$(document).on("click", "#goCreation", () => {
    updateCreateDistrib = 1;
    $("#updateCreateRepas").show();
    $("#divHeure").show();
    $("#creationRepas").val("créer");
    $("#poids").val(0);
    $("#time").val("00:00");
});

$(document).on("click", "#supprimer", () => {
    const repasId = $("#listRepas").val();
    console.log(repasId);
    deleteMeal(repasId);
    showMenuSelect();
});

$(document).on("click", "#creationRepas", () => {

    const poids = $("#poids").val();
    const heure = $("#time").val();
    console.log("updateCreateDistrib")
    console.log(updateCreateDistrib);
    if (updateCreateDistrib == 1)
        createMeal(heure, poids);
    else if (updateCreateDistrib == 0) {
        const repasId = $("#listRepas").val();
        updateMeal(heure, poids, repasId);

    }
    else if (updateCreateDistrib == -1) {
        console.log("coucou")
        distribution(poids);
    }
    showMenuSelect();
})

$(document).on("click", "#modifier", () => {
    const poids = $("#listRepas option:selected").data("poids");
    const heure = $("#listRepas option:selected").data("time");

    updateCreateDistrib = 0;
    $("#divHeure").show();
    $("#poids").val(poids);
    $("#time").val(heure);
    $("#creationRepas").val("modifier");
    $("#updateCreateRepas").show();
})
socket.onmessage = (event) => {
    console.log("event!")
    console.log(event.data);
}
socket.onclose = () => {
    $("#corps").hide();
}

function showMenuSelect() {
    getAllMeal().then((data) => {
        console.log("rentré!");
        console.log("action : ");
        console.log(data.action);
        console.log(data);
        $("#listRepas").html("");
        data.repas.forEach((repas) => {

            $("#listRepas").append($("<option>").val(repas.id).html("heure : " + repas.heure + " ,  poids " + repas.poids + " g").data(("time"), (repas.heure)).data(("poids"), (repas.poids)));
        });

        $("#corps").show();
    });
}
function requestData(action) {
    const msg = {
        type: "message",
        action: action,
        id: id
    }
    sleep(200);
    socket.send(JSON.stringify(msg));
    return new Promise((cb) => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            cb(data);
        }
    })
}

function getAllMeal() {
    const msg = {
        type: "message",
        action: "requestData",
        id: id
    }
    sleep(200);
    socket.send(JSON.stringify(msg));
    return new Promise((cb) => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.action == undefined) {
                cb(data);
            }
        }
    })
}

function createMeal(heure, poids) {
    const msg = {
        type: "message",
        action: "addMeal",
        heure: heure,
        poids: poids,
        id: id
    }
    socket.send(JSON.stringify(msg));
}

function distribution(poids) {
    const msg = {
        type: "message",
        action: "eatNow",
        poids: poids,
        id: id
    }
    socket.send(JSON.stringify(msg));
}


function deleteMeal(repasId) {
    const msg = {
        type: "message",
        action: "deleteMeal",
        repasId: repasId,
        id: id
    }
    socket.send(JSON.stringify(msg));
}
function updateMeal(heure, poids, repasId) {
    const msg = {
        type: "message",
        action: "update",
        heure: heure,
        poids: poids,
        repasId: repasId,
        id: id
    }
    socket.send(JSON.stringify(msg));
}
function eatNow(poids) {
    const msg = {
        type: "message",
        action: "eatNow",
        poids: poids,
        id: id
    }
    socket.send(JSON.stringify(msg));
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function checkWebSocket() {
    if (socket.readyState !== socket.OPEN) {
        $("#updateCreateRepas").hide();
    }
    window.setTimeout(checkWebSocket, 30000);
}
