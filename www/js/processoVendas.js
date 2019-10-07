function selectCliente(params) {
    document.getElementById('codigoCliente').value = params.ref_codigo;
    document.getElementById('nomeCliente').value = params.ref_codigo +'-'+ params.nome_cliente; 
    /*
    $('.select2Cliente').select2({
        minimumInputLength: 2
    });*/

    loading('Aguarde, estamos sincronizando os dados...');
    setTimeout(function() {
        selectProduto();
        select2CondPagamento();
        select2TipoPagamento();
    }, 500);
    /*db.transaction(function (txn) {
        txn.executeSql("select * from clientes", [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    clientes.push(res.rows[i]);
                } else {
                    clientes.push(res.rows._array[i]);
                }
            }
            setTimeout(function() {
                selectProduto();
                select2CondPagamento();
                select2TipoPagamento();
            }, 500);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });*/
}

function select2CondPagamento() {
    $('.select2CondPagamento').select2({
        minimumInputLength: 0
    });

    db.transaction(function (txn) {
        txn.executeSql("select * from condicao", [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    condicao.push(res.rows[i]);
                } else {
                    condicao.push(res.rows._array[i]);
                }
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function select2TipoPagamento() {
    $('.select2TipoPagamento').select2({
        minimumInputLength: 0
    });

    db.transaction(function (txn) {
        txn.executeSql("select * from tipo", [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    tipo.push(res.rows[i]);
                } else {
                    tipo.push(res.rows._array[i]);
                }
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function selectProduto() {
    $('.select2Produto').select2({
        minimumInputLength: 2
    });
    db.transaction(function (txn) {
        txn.executeSql("select * from produtos", [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    produtos.push(res.rows[i]);
                } else {
                    produtos.push(res.rows._array[i]);
                }
            }
            //console.log(res);
            setTimeout(function() {
                closeLoading();
            }, 1000);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}