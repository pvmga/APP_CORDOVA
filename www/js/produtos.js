function getProdutos() {
    produtos = [];
    loading('Aguarde, estamos sincronizando os dados...');

    var campoPesquisa = document.getElementById('campoPesquisa').value;
    var sql = "";
    if (campoPesquisa !== '') {
        sql = "select * from produtos where descricao like '%"+campoPesquisa+"%' or ref_codigo like '%"+campoPesquisa+"%' limit 30";
    } else {
        sql = "select * from produtos limit 300";
    }

    //console.log(sql);
    //db = sqlitePlugin.openDatabase({name: 'mydb.db'});
    db.transaction(function (txn) {
        txn.executeSql(sql, [],
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

function alertProduto(codigo) {

    dadosProduto = [];

    db.transaction(function (txn) {
        txn.executeSql("select * from produtos where ref_codigo = ?", [codigo],
        function (tx, res) {
            if (typeof networkState === 'undefined') {
                dadosProduto.push(res.rows[0]);
            } else {
                dadosProduto.push(res.rows._array[0]);
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });

    alert({
        title:'Visualização do produto',
        message:'Produto: ' + codigo,
        template: 'template-alert-custom',
        width:'90%',
        buttons:[
        {
            label: 'Fechar',
            onclick: function(){
                closeAlert();
            }
        }
      ]
    });
}