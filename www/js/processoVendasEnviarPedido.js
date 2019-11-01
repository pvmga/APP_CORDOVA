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

function preparaPedido() {
    loading('Aguarde, enviado o pedido...');

    var condicao = $('.select2CondPagamento option:selected').val();
    var tipo = $('.select2TipoPagamento option:selected').val();

    // codigo cliente gadm
    var cod_clie = document.getElementById('refCodigoCliente').value;
    
    var codigo_vendedor = document.getElementById('codigoVendedor').textContent;
    produtos = [];

    if (cod_clie === '') {
        closeLoading();
        alert('Não será possivel enviar pedido para este cliente. NÃO SINCRONIZADO.');
        return false;
    }

    dadosVenda = {
        cod_clie: cod_clie,
        condicao: condicao,
        tipo: tipo,
        vendedor_externo: dadosUser.cod_vendedor_externo,
        usuario: dadosUser.usuario,
        codigo_vendedor: codigo_vendedor
    }

    // codigo cliente interno
    var sql = "select * from itensven where cod_clie = " + document.getElementById('codigoCliente').value;
    
    // busca produtos
    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    produtos.push(res.rows[i]);
                } else {
                    produtos.push(res.rows._array[i]);
                }

                // garantir que só irá entrar após finalizar a inclusão de todos os produtos no array
                //if (i == res.rows.length) {
                    //enviarPedido(dadosVenda, produtos);
                //}
            }

            enviarPedido(dadosVenda, produtos);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });

}

function enviarPedido(dadosVenda, itensVenda) {
    if (itensVenda.length === 0) {
        alert('Não é permitido enviar pedido com 0 produtos.');
        closeLoading();
        return false;
    }

    
    var request = $.ajax({
        url: BASE_URL+"/inserirVenda/",
        method: "POST",
        data: { dadosVenda : dadosVenda, itensVenda: itensVenda },
        dataType: "json"
    });
    
    request.done(function( res ) {
        verificaExistenciaVendaLocal(res);
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function verificaExistenciaVendaLocal(res) {
    var request = $.ajax({
        url: BASE_URL+"/existeVenda/",
        method: "POST",
        data: { codVenda : res.cod_venda },
        dataType: "json"
    });
    
    request.done(function( resInsert ) {
        closeLoading();
        if (resInsert.dados[0].COD_VENDA !== '') {
            var msg = resInsert.msg +'. <b>Codigo:</b> '+ resInsert.dados[0].COD_VENDA;
            confirmaVendaExcluida(msg);
        } else {
            alert('Não conseguimos enviar o pedido. Tente enviar novamente.');
            return false;
        }
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function confirmaVendaExcluida(msg) {
    alert({
        id: 'alert-exclusao',
        title:'Alerta !',
        message: msg,
        buttons:[
                {
                label:'Ok',
                onclick: function() {
                    cancelarVenda();
                }
            }
        ]
    });
}