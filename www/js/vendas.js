function openTabs(tab){
    switch (tab) {
        case 'orcamentos':
            include('orcamentos', './pages/includes/orcamentos', buscarVendas);
        break;
        case 'enviados':
            include('enviados', './pages/includes/enviados');
        break;
        case 'faturados':
            include('faturados', './pages/includes/faturados');
        break;
    }
    openTab(tab);
}

function buscarVendas() {
    var tipo_venda = $('#tipo_venda_selecionado option:selected').val();
    
    if (tipo_venda !== '') {
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
}