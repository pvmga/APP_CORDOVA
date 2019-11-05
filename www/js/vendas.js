function openTabs(tab){
    switch (tab) {
        case 'orcamentos':
            include('orcamentos', './pages/includes/orcamentos', orcamentos);
        break;
        case 'enviados':
            include('enviados', './pages/includes/enviados', function() {
                buscarVendas(obterData(), obterData());
                
            });
        break;
        case 'faturados':
            include('faturados', './pages/includes/faturados');
        break;
    }
    openTab(tab);
}

function orcamentos() {

    todasVendas = [];
    loading('Buscando dados...');

    var sql = "select v.*, c.descricao as descricao_cond, t.descricao as descricao_tipo, cl.* \
    from venda v \
    join condicao c on(v.cod_pagamento = c.ref_codigo) \
    join tipo t on(v.tipo_pagamento = t.sigla)\
    join clientes cl on(v.cod_clie = cl.codigo)\
    where v.sincronizado = 'N' order by v.cod_venda desc";

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    todasVendas.push(res.rows[i]);
                } else {
                    todasVendas.push(res.rows._array[i]);
                }
            }

            setTimeout(function() {
                closeLoading();
            }, 500);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function buscarVendas(data_inicial, data_final) {
    if (data_inicial !== '') {
        $('#dt_inicial').val(data_inicial);
        $('#dt_final').val(data_final);
    }
        
    todasVendas = [];
    loading('Buscando dados...');

    var datas = {
        dt_inicial: $('#dt_inicial').val(),
        dt_final: $('#dt_final').val()
    }

    var request = $.ajax({
        url: BASE_URL+"/getVendas/?vendedor="+47,
        method: "POST",
        data: { datas: datas },
        dataType: "json"
    });
    
    request.done(function( res ) {
        //console.log(res);
        for(var i=0; i<res.length; i++) {
            todasVendas.push(res[i]);
        }
        setTimeout(function() {
            closeLoading();
        }, 500);
    });
    
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        closeLoading();
        console.log(textStatus, jqXHR);
    });
}

function preecherMaskFiltroVenda() {
    setTimeout(function() {
        $(".dt_inicial").mask("99/99/9999");
        $('.dt_final').mask('99/99/9999');
    }, 300);
}