function verificarExclusao() {
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
                    excluirVenda();
                }
            }
        ]
    });
}

function excluirVenda() {
    cancelarVenda();
    setTimeout(function() {
        closeAlert('alert-exclusao');
        backPage();
    }, 500);
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
}

function inserirCliente() {
    var cliente;
    var cod_vendedor_externo = dadosUser.cod_vendedor_externo;

    var request = $.ajax({
        url: BASE_URL+"/inserirCliente/",
        method: "POST",
        data: { dadosCliente : dadosCliente, cod_vendedor_externo: cod_vendedor_externo },
        dataType: "json",
        async: false
    });
    
    request.done(function( res ) {
        //console.log(res);
        // para o sistema entender que o cliente já esta na base de dados local.
        updateRefCliente(res);
        document.getElementById('refCodigoCliente').value = res;
        cliente = res;
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });

    return cliente;
}

function updateRefCliente(cod_clie) {

    var sql = "update clientes set ref_codigo = "+cod_clie+", sincronizado = 'S' where codigo = "+dadosCliente.codigo;

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            console.log('update ref cliente.');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function preparaPedido() {
    loading('Aguarde, enviado o pedido...');

    setTimeout(function() {
        
        var condicao = $('.select2CondPagamento option:selected').val();
        var tipo = $('.select2TipoPagamento option:selected').val();
        var observacao = $('#observacao_pedido').val();
        var transportadora = document.getElementById('transportadora').textContent;

        // codigo cliente gadm
        //var cod_clie = document.getElementById('refCodigoCliente').value;
        var cod_clie = inserirCliente();
        
        var codigo_vendedor = document.getElementById('codigoVendedor').textContent;
        produtos = [];

        if (tipo === '') {
            closeLoading();
            alert('Não é permitido enviar pedido com o tipo de pagamento vazio.');
            return false;
        }

        dadosVenda = {
            cod_clie: cod_clie,
            condicao: condicao,
            condicao_descricao: $('.select2CondPagamento option:selected').text(),
            tipo: tipo,
            tipo_descricao: $('.select2TipoPagamento option:selected').text(),
            vendedor_externo: dadosUser.cod_vendedor_externo,
            usuario: dadosUser.usuario,
            codigo_vendedor: codigo_vendedor,
            observacao: observacao,
            transportadora: transportadora,
            dadosCliente: dadosCliente,
            total_produtos: $('#vlr_total_produtos').val(),
            total_st_ipi: $('#vlr_total_st_ipi').val(),
            total_venda: $('#vlr_total_venda').val()
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
    },200);

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
        verificaExistenciaVendaLocal(res, dadosVenda, itensVenda);
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function verificaExistenciaVendaLocal(res, dadosVenda, itensVenda) {
    var request = $.ajax({
        url: BASE_URL+"/existeVenda/",
        method: "POST",
        data: { codVenda : res.cod_venda },
        dataType: "json"
    });
    
    request.done(function( resInsert ) {
        if (resInsert['dados'][0]['COD_VENDA']) {
            closeLoading();
            cancelarVenda();
            // perguntar envio
            confirmaEnvioEmail(resInsert, dadosVenda, itensVenda);
        } else {
            alert('Não encontramos o pedido na base de dados local. Tente enviar novamente.');
            closeLoading();
            return false;
        }
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function confirmaEnvioEmail(resInsert, dadosVenda, itensVenda) {
    alert({
        id: 'alert-confirm-email',
        title:'Alerta !',
        message: 'Enviar e-mail ?',
        buttons:[
            {
                label:'Não',
                onclick: function(){
                    setTimeout(function() {
                        var msg = resInsert.msg +'. <b>Codigo:</b> '+ resInsert.dados[0].COD_VENDA;
                        confirmaVendaExcluida(msg);
                    }, 100);
                }
            },
            {
                label:'Sim',
                onclick: function() {
                    setTimeout(function() {
                        enviarEmailPedido(resInsert, dadosVenda, itensVenda);
                    }, 100);
                }
            }
        ]
    });
}

function enviarEmailPedido(res, dadosVenda, itensVenda) {

    var request = $.ajax({
        url: BASE_URL+"/enviarEmailPedido/",
        method: "POST",
        data: { codVenda: res.dados[0].COD_VENDA, dadosVenda: dadosVenda, itensVenda: itensVenda },
        dataType: "json",
        async: false,
    });
    
    request.done(function( resInsert ) {
        //console.log(resInsert);
        var msg = res.msg +'. <b>Codigo:</b> '+ res.dados[0].COD_VENDA;
        confirmaVendaExcluida(msg);
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function confirmaVendaExcluida(msg) {
    closeAlert('alert-confirm-email');
    alert({
        id: 'alert-exclusao',
        title:'Alerta !',
        message: msg,
        buttons:[
                {
                label:'Ok',
                onclick: function() {
                    closeAlert('alert-exclusao');
                    backPage();
                }
            }
        ]
    });
}