function openTabs(tab){
    switch (tab) {
        case 'orcamentos':
            include('orcamentos', './pages/includes/orcamentos', orcamentos);
        break;
        case 'enviados':
            include('enviados', './pages/includes/enviados', buscarVendas);
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

    var sql = "select v.*, c.descricao as descricao_cond, t.descricao as descricao_tipo, cl.nome_fantasia \
    from venda v \
    join condicao c on(v.cod_pagamento = c.ref_codigo) \
    join tipo t on(v.tipo_pagamento = t.ref_codigo)\
    join clientes cl on(v.cod_clie = cl.codigo) \
    where v.sincronizado = 'N' order by v.cod_venda desc";

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            console.log(res.rows);
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    todasVendas.push(res.rows);
                } else {
                    todasVendas.push(res.rows._array);
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

function buscarVendas() {
    
    todasVendas = [];
    loading('Buscando dados...');

    MobileUI.ajax.get(BASE_URL+'/getVendas/')
    .query({ vendedor: 47 })
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getVendas)!');
            return console.log(error);
        }
        var r = res.body;
        for(var i=0; i<r.length; i++) {
            //console.log(r[i]);
            todasVendas.push(r[i]);
        }
        setTimeout(function() {
            closeLoading();
        }, 1000);
    });
}