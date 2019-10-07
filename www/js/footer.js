function sairApp() {
    navigator.app.exitApp();
}

checkConnection();
function checkConnection() {
    document.addEventListener("offline", checarOffline);
    document.addEventListener("online", checarOnline);
    //alert(networkState);
}
function checarOffline() {
    document.getElementsByClassName('tipo_conexao')[0].innerHTML = networkState;
    //console.log('estou offline: ' + networkState);
}

function checarOnline() {
    document.getElementsByClassName('tipo_conexao')[0].innerHTML = networkState;
    //console.log('estou online ' + networkState);
}