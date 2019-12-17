/*
setTimeout(function() {
    getClientes();
}, 1000);*/
function getClientes() {
    clientes = [];
    loading('Aguarde, estamos sincronizando os dados...');

    var valorPesquisa = document.getElementById('campoPesquisa').value;
    var sql = "";
    if (valorPesquisa !== '') {
        sql = "select * from clientes where nome_fantasia like '%"+valorPesquisa+"%' or razao_social like '%"+valorPesquisa+"%' or ref_codigo like '%"+valorPesquisa+"%' limit 25";
    } else {
        sql = "select * from clientes";
    }

    //console.log(sql);

    //db = sqlitePlugin.openDatabase({name: 'mydb.db'});
    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    clientes.push(res.rows[i]);
                } else {
                    clientes.push(res.rows._array[i]);
                }
            }
            setTimeout(function() {
                closeLoading();
            }, 1000);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function buscaCep() {
    loading('Aguarde, estamos sincronizando os dados...');
    var cep = document.getElementById('cep').value;
    MobileUI.ajax.get('https://viacep.com.br/ws/'+cep+'/json/')
    .end(function (error, res) {
        if (error) {
            //closeLoading();
            alert('Ops! Erro ao consultar dados da API (buscaCep)!');
            closeLoading();
            return console.log(error);
        }
        var r = res.body;
        document.getElementById('endereco').value = r.logradouro;
        document.getElementById('bairro').value = r.bairro;
        document.getElementById('cidade').value = r.localidade;
        document.getElementById('estado').value = r.uf;
        setTimeout(function() {
            closeLoading();
        }, 300);

    });

}

function alertCliente(codigo) {

    dadosCliente = [];

    db.transaction(function (txn) {
        txn.executeSql("select * from clientes where codigo = ?", [codigo],
        function (tx, res) {
            if (typeof networkState === 'undefined') {
                dadosCliente.push(res.rows[0]);
            } else {
                dadosCliente.push(res.rows._array[0]);
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });

    alert({
        title:'Visualização do cliente',
        message:'Cliente: ' + codigo,
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

function verificarTipo() {
    var tipo = document.querySelector('.natureza').value;
    $('#cpf_cnpj').val('');
    $('#rg_inscricao').val('');
    $('#nome_fantasia').val('');
    $('#razao_social').val('');
    if (tipo === 'F')  {
        $('#cpf_cnpj').mask('999.999.999-99');
    } else {
        $('#cpf_cnpj').mask('99.999.999/9999-99');
    }
    
}

function mask() {
    //$('#natureza').attr('disabled', true);
    $('#cep').mask('99999-570');
    $('#telefone').mask('(99) 9999-9999');
    $('#celular').mask('(99) 99999-9999');
    verificarTipo();
}

function confirmacao() {

    alert({
        title:'Salvar dados',
        message:'Deseja realmente gravar ?',
        template: 'template-alert-confirma',
        width:'90%',
        class: 'blue-800',
        buttons:[
        {
            label: 'Cancelar',
            class: 'text-white',
            onclick: function(){
                closeAlert();
            }
        },
        {
            label: 'Gravar',
            class: 'blue-900',
            onclick: function(){
                closeAlert();
                salvarCliente();
            }
        }
      ]
    });
}

function salvarCliente() {

    if ($('#cpf_cnpj').val() === '') {
        alert('CPF/CNPJ não pode ser vazio.');
        return false;
    }

    if ($('#nome_fantasia').val() === '') {
        alert('Nome fantasia não pode ser vazio.');
        return false;
    }

    if ($('#razao_social').val() === '') {
        alert('Razão social não pode ser vazio.');
        return false;
    }
    /*console.log(
        $('#natureza option:selected').val(),
        $('#cpf_cnpj').val(),
        $('#rg_inscricao').val(),
        $('#nome_fantasia').val().toUpperCase(),
        $('#razao_social').val(),
        $('#cep').val(),
        $('#endereco').val(),
        $('#num_end_principal').val(),
        $('#bairro').val(),
        $('#cidade').val(),
        $('#estado').val(),
        $('#comp_endereco').val(),
        $('#telefone').val(),
        $('#celular').val(),
        $('#contato').val(),
        $('#email').val(),
        $('#transportadora').val(),
        $('#obs_cadastro').val()
    );*/

    db.transaction(function (txn) {
        txn.executeSql("insert into clientes (natureza, cgc, inscricao, nome_fantasia, razao_social, cep, endereco, num_end_principal, bairro, cidade, estado, comp_endereco, telefone, celular, contato, email, transportadora, obs_cadastro, sincronizado) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [$('#natureza option:selected').val(), $('#cpf_cnpj').val(), $('#rg_inscricao').val(), $('#nome_fantasia').val().toUpperCase(), $('#razao_social').val().toUpperCase(), $('#cep').val(), $('#endereco').val().toUpperCase(), $('#num_end_principal').val(), $('#bairro').val().toUpperCase(), $('#cidade').val().toUpperCase(), $('#estado').val().toUpperCase(), $('#comp_endereco').val().toUpperCase(), $('#telefone').val(), $('#celular').val(), $('#contato').val().toUpperCase(), $('#email').val().toUpperCase(), $('#transportadora').val(), $('#obs_cadastro').val().toUpperCase(), 'N'],
        function (tx, res) {
            // limpar variavel.
            produtos = [];
            openPage('pages/clientes');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

MobileUI.validaValor = function(v) {
    if (v === 'N') {
        return 'text-red';
    } else {
        return 'text-green';
    }

}