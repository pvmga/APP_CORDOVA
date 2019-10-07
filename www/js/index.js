var produtos = [];
var dadosProduto = [];
var clientes = [];
var dadosCliente = [];
var todasVendas = [];
var condicao = [];
var tipo = [];

document.addEventListener('backPage', function(){
    produtos = [];
    dadosProduto = [];
    clientes = [];
    dadosCliente = [];
    todasVendas = [];
    condicao = [];
    tipo = [];
});

var networkState = navigator.connection.type;
setTimeout(function() {
//    openPage('../pages/vendas');
//    openPage('../pages/processoVendas');
//    openPage('../pages/clientes_cadastro');
//    openPage('../pages/clientes');
//    openPage('../pages/produtos');
//    openPage('../home');
}, 500)

var BASE_URL = 'http://192.168.1.33/projetos/WS_APP'; // localhost
//var BASE_URL = 'http://200.150.122.150/WS_APP'; // externo
//var BASE_URL = 'http://192.168.1.33:3000'; // localhost

/* LOGIN */
function sincroniza(cod_vendedor_externo) {
  
    loading('Aguarde, estamos sincronizando os dados...');
    sincronizadorProdutos();
    setTimeout(function() {
        sincronizadorClientes(cod_vendedor_externo);
    }, 1000);
}

function sincronizadorUsuarios(apelido, senha, codigo, vendedor) {
    insertUsuarios(apelido, senha, codigo, 0, 1, vendedor);
}

// NBMI
sincronizadorNbmi();
function sincronizadorNbmi() {
    MobileUI.ajax.get(BASE_URL+'/getNbmi/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getNbmi)!');
            return console.log(error);
        }
        
        var r = res.body;
        //console.log(r);
        /*deletarNbmi();
        for (var x=0; x<r.length; x++) {*/
            inserirNbmi(r);
        //}
    });
}

function inserirNbmi(r) {
    console.log(r);
    /*db.transaction(function (txn) {
        txn.executeSql('insert into condicao (ref_codigo, descricao, acrescimo) values (?,?,?)', [codigo, descricao, acrescimo],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });*/
}

function deletarNbmi() {
    db.transaction(function (txn) {
        txn.executeSql('delete from cad_nbmi', [],
        function (tx, res) {
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}
//

sincronizadorCondicaoPagamento();
function sincronizadorCondicaoPagamento() {
    MobileUI.ajax.get(BASE_URL+'/getCondPagamentos/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getCondPagamentos)!');
            return console.log(error);
        }
        
        var r = res.body;
        deletarCond();
        for (var x=0; x<r.length; x++) {
            inserirCond(r[x].CODIGO, r[x].DESCRICAO, r[x].ACRESCIMO);
        }
    });
}

function inserirCond(codigo, descricao, acrescimo) {
    db.transaction(function (txn) {
        txn.executeSql('insert into condicao (ref_codigo, descricao, acrescimo) values (?,?,?)', [codigo, descricao, acrescimo],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarCond() {
    db.transaction(function (txn) {
        txn.executeSql('delete from condicao', [],
        function (tx, res) {
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

sincronizadorTipoPagamentos();
function sincronizadorTipoPagamentos() {
    MobileUI.ajax.get(BASE_URL+'/getTipoPagamentos/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getTipoPagamentos)!');
            return console.log(error);
        }
        
        var r = res.body;
        deletarTipo();
        for (var x=0; x<r.length; x++) {
            inserirTipo(r[x].CODIGO, r[x].DESCRICAO, r[x].PREFIXO, r[x].SIGLA);
        }
    });
}

function inserirTipo(codigo, descricao, prefixo, sigla) {
    db.transaction(function (txn) {
        txn.executeSql('insert into tipo (ref_codigo, descricao, prefixo, sigla) values (?,?,?,?)', [codigo, descricao, prefixo, sigla],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarTipo() {
    db.transaction(function (txn) {
        txn.executeSql('delete from tipo', [],
        function (tx, res) {
            //console.log('(TIPO) QUANTIDADE DE REGISTROS DELETADOS: ' + res.rowsAffected);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

//====

sincronizadorEstados();
function sincronizadorEstados() {
    MobileUI.ajax.get(BASE_URL+'/getEstados/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getEstados)!');
            return console.log(error);
        }
        
        var r = res.body;
        deletarEstado();
        for (var x=0; x<r.length; x++) {
            inserirEstado(r[x]);
        }
    });
}

function inserirEstado(dados) {
    db.transaction(function (txn) {
        txn.executeSql('insert into estados (sigla_estado, desc_estado, optante_st, aliquota_externa_icms, aliquota_interna_icms, imp_aliquota_interna_icms, imp_aliquota_externa_icms) values (?,?,?,?,?,?,?)',
        [dados.SIGLA_ESTADO, dados.DESC_ESTADO, dados.OPTANTE_ST, dados.ALIQUOTA_EXTERNA_ICMS, dados.ALIQUOTA_INTERNA_ICMS, dados.IMP_ALIQUOTA_INTERNA_ICMS, dados.IMP_ALIQUOTA_EXTERNA_ICMS],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarEstado() {
    db.transaction(function (txn) {
        txn.executeSql('delete from estados', [],
        function (tx, res) {
            //console.log('(ESTADOS) QUANTIDADE DE REGISTROS DELETADOS: ' + res.rowsAffected);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}


//====

function sincronizadorProdutos() {
    MobileUI.ajax.get(BASE_URL+'/getProdutos/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getProdutos)!');
            return console.log(error);
        }
        
        var r = res.body;
        deletarProdutos();
        for (var x=0; x<r.length; x++) {
            inserirProdutos(r[x].CODIGO, r[x].DESCRICAO, r[x].ESTOQUEATUAL, r[x].PRECO_VENDA_A, r[x].PRECO_VENDA_A_ORIGINAL, x, r.length);
        }
    });
}

function sincronizadorClientes(cod_vendedor_externo) {
    MobileUI.ajax.get(BASE_URL+'/getClientes/')
    .query({vendedor: cod_vendedor_externo})
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getClientes)!');
            return console.log(error);
        }
        
        var r = res.body;
        deletarClientes();
        for (var x=0; x<r.length; x++) {
            insertClientes(
                x,
                r.length,
                r[x].CODIGO,
                r[x].NOME_FANTASIA,
                r[x].RAZAO_SOCIAL,
                r[x].NATUREZA,
                r[x].CGC,
                r[x].INSCRICAO,
                r[x].CPF,
                r[x].RG,
                r[x].CEP,
                r[x].ENDERECO,
                r[x].NUM_END_PRINCIPAL,
                r[x].COMP_ENDERECO,
                r[x].BAIRRO,
                r[x].CIDADE,
                r[x].ESTADO,
                r[x].TELEFONE,
                r[x].CELULAR,
                r[x].CONTATO,
                r[x].TRANSPORTADORA,
                r[x].EMAIL,
                r[x].OBS_CADASTRO,
                r[x].CONSUMIDOR_FINAL,
                r[x].DISP_ST,
                r[x].CODIGO_VENDEDOR,
                r[x].VENDEDOR_EXTERNO,
                r[x].CONTRIBUINTE_ICMS
            );
        }
    });
}

function deletarProdutos() {
    db.transaction(function (txn) {
        txn.executeSql('delete from produtos', [],
        function (tx, res) {
            console.log('(PRODUTOS) QUANTIDADE DE REGISTROS DELETADOS: ' + res.rowsAffected);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarUsuarios(apelido, senha, codigo, vendedor) {
    db.transaction(function (txn) {
        txn.executeSql('delete from usuarios', [],
        function (tx, res) {
            console.log('(USUARIOS) QUANTIDADE DE REGISTROS DELETADOS: ' + res.rowsAffected);
            sincronizadorUsuarios(apelido, senha, codigo, vendedor);
            sincroniza(vendedor);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarClientes() {
    db.transaction(function (txn) {
        txn.executeSql('delete from clientes', [],
        function (tx, res) {
            console.log('(CLIENTES) QUANTIDADE DE REGISTROS DELETADOS: ' + res.rowsAffected);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function inserirProdutos(ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original, inicio, final) {
    //console.log(ref_codigo, descricao, estoqueatual, preco_venda_a);
    db.transaction(function (txn) {
        txn.executeSql('insert into produtos (ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original) values (?,?,?,?,?)', [ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original],
        function (tx, res) {
            if (inicio === (final -1)) {
                console.log('(PRODUTOS) REALIZADO INSERT EM ' + final + ' REGISTROS.');
                //alerta('Sincronização.', 'Processo de sincronização finalizado.');
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertUsuarios(usuario, senha, ref_codigo, inicio, final, cod_vendedor_externo) {
    db.transaction(function (txn) {
        txn.executeSql('insert into usuarios (usuario, senha, ref_codigo, cod_vendedor_externo) values (?,?,?,?)', [usuario, senha, ref_codigo, cod_vendedor_externo],
        function (tx, res) {
            if (inicio === (final -1)) {
                console.log('(USUARIOS) REALIZADO INSERT EM ' + final + ' REGISTROS.');
                //alerta('Sincronização.', 'Processo de sincronização finalizado.');
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertClientes(inicio, final, ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, disp_st, codigo_vendedor, vendedor_externo, contribuinte_icms) {
    db.transaction(function (txn) {
        txn.executeSql('insert into clientes (ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, disp_st, codigo_vendedor, cod_vendedor_externo, contribuinte_icms) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, disp_st, codigo_vendedor, vendedor_externo, contribuinte_icms],
        function (tx, res) {
            if (inicio === (final -1)) {
                closeLoading();
                openPage('home');
                console.log('(CLIENTES) REALIZADO INSERT EM ' + final + ' REGISTROS.');
                //alerta('Sincronização.', 'Processo de sincronização finalizado.');
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function obterData() {
    // Obtém a data/hora atual
    var data = new Date();

    // Guarda cada pedaço em uma variável
    var dia     = data.getDate();           // 1-31
    var mes     = data.getMonth();          // 0-11 (zero=janeiro)
    var ano4    = data.getFullYear();       // 4 dígitos

    // Formata a data e a hora (note o mês + 1)
    var str_data = dia + '/' + (mes+1) + '/' + ano4;

    return str_data
}

function atualizarData() {
    data = obterData();

    db.transaction(function (txn) {
        txn.executeSql('insert into atualizacao (data_atualizacao) values (?)', [data],
        function (tx, res) {
            console.log('Atualizado a tabela de atualização.');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}
function verificarAtualizador(cod_vendedor_externo) {
    data = obterData();

    db.transaction(function (txn) {
        txn.executeSql('select * from atualizacao where data_atualizacao = ? limit 1', [data],
        function (tx, res) {
            var tipo_teste = 0;
            if (typeof networkState === 'undefined') {
                tipo_teste = res.rows.length;
            } else {
                tipo_teste = res.rows._array.length;
            }
            //console.log("verifica atualizador: ",res.rows);
            if (tipo_teste == 1) {
                openPage('home');
                console.log('Já foi atualizado');
            } else {
                atualizarData();
                //document.cookie = "codigo="+dados.rows.item(0).codigo+";usuario="+dados.rows.item(0).usuario+"";
                sincroniza(cod_vendedor_externo);
                
                console.log('Não foi atualizado');
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function validarLogin() {
    loadingElement('btn-validar', 'Validando...');
    var usuario = document.getElementById('usuario').value.toUpperCase();
    var senha = document.getElementById('senha').value.toUpperCase();

    if (!usuario) {
        alerta('Usuário.', 'Ops! Usuário não pode ser vazio.');
        closeLoading('btn-validar');
        return false;
    }

    if (!senha) {
        alerta('Senha.', 'Ops! Senha não pode ser vazia.');
        closeLoading('btn-validar');
        return false;
    }

    db.transaction(function (txn) {
        var sql = 'select * from usuarios where usuario=? and senha=?';
        txn.executeSql(sql,[usuario, senha],
            function (tnx, res) {
                var tipo_teste = 0;
                if (typeof networkState === 'undefined') {
                    tipo_teste = res.rows.length;
                } else {
                    tipo_teste = res.rows._array.length;
                }
                //console.log("valida login: ",res);
                if (tipo_teste == 0) {
                    verificarOnline(usuario, senha);
                    //alerta('Inconsistência.', 'Usuário ou senha inválidos.');
                    //closeLoading('btn-validar');
                } else {
                    verificarAtualizador(res.rows.item(0).cod_vendedor_externo);
                }
            },
            function (tnx, error) {
                alert('Ops! Erro ao checar dados do usuário. Tente novamente ou entre em contato com o suporte.');
                console.log(tnx, error);
                return false;
            });
    });
}

function verificarOnline(usuario, senha) {
    console.log('Buscando novo usuário !');
    MobileUI.ajax.get(BASE_URL+'/getUsuarios/')
    .query({ usuario: usuario, senha: senha })
    .end(function (error, res) {
        if (error) {
            alert('Ops! Erro ao salvar dados na API (getUsuarios)');
            closeLoading('btn-validar');
            return console.log(error);
        }
        var r = res.body;
        if (r === false) {
            closeLoading('btn-validar');
            alerta('Login', 'Não encontramos o usuário, tente novamente ou entre em contato com o suporte.');
        } else {
            //deletarAtualizacao();
            atualizarData();
            // DELETAR OS USUÁRIOS SOMENTE QUANDO FOR UM USUÁRIO NOVO, SENDO ASSIM SEMPRE VOU MANTER UM USUÁRIO NA BASE DE DADOS DO SISTEMA.
            deletarUsuarios(r[0].APELIDO, r[0].SENHA, r[0].CODIGO, r[0].VENDEDOR);
            //console.log(r[0].VENDEDOR);
        }
        
    });
}

function alerta(title, msg) {
    alert({
        title: title,
        message: msg,
        buttons:[
            {
                label: 'OK',
                onclick: function(){
                    closeAlert();
                }
            }
        ]
    });
}
/* /LOGIN */