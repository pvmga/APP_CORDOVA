function verificarExclusao(){
    alert({
        id: 'alert-exclusao',
        title:'Alerta !',
        message:'Será excluído o pedido. Deseja realmente cancelar ?',
        buttons:[
            {
                label: 'Não',
                onclick: function(){
                    closeAlert();
                }
            },
                {
                label:'Sim',
                onclick: function() {
                    cancelarVenda();
                }
            }
        ]
    });
}

function cancelarVenda() {
    var codigoCliente = $('#codigoCliente').val();

    var sql1 = "delete from venda where cod_clie = "+codigoCliente;
    db.transaction(function (txn) {
        txn.executeSql(sql1, [],
        function (tx, res) {
            console.log('Venda deletada. Cliente: ' + codigoCliente);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });

    var sql2 = "delete from itensven where cod_clie = "+codigoCliente;
    db.transaction(function (txn) {
        txn.executeSql(sql2, [],
        function (tx, res) {
            console.log('Itens deletado. Cliente: ' + codigoCliente);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });

    setTimeout(function() {
        closeAlert('alert-exclusao');
        backPage();
    }, 500);
}

function enviarPedido() {
    loading('Aguarde, enviado o pedido...');

    MobileUI.ajax.get(BASE_URL+'/inserirVenda/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (inserirVenda)!');
            return console.log(error);
        }
        
        var r = res.body;
        setTimeout(function() {
            closeLoading();
            alert(r);
        }, 200)
    });
}