function sairApp() {
    navigator.app.exitApp();
}

//document.addEventListener('deviceready', checkConnection);

function checkConnection() {
    
    document.addEventListener('offline', deviceOffline);
    document.addEventListener('online', deviceOnline);
}

function deviceOffline() {
    alert('<b>Alerta !</b> <br /><br />O aplicativo necessita de uma conexão com a Internet para transmitir ou atualizar dados.');
    //document.getElementsByClassName('tipo_conexao')[0].innerHTML = 'offline';
    return false;
}

function deviceOnline() {
    alert('<b>Alerta !</b> <br /><br />Conexão com internet restabelecida.');
    //document.getElementsByClassName('tipo_conexao')[0].innerHTML = networkState;
    return false;
}

//document.getElementsByClassName('tipo_conexao')[0].innerHTML = networkState;