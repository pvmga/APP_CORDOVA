// VERSÃO APP
var VERSAO = '1.0.0';

setTimeout(function() {
    checarVersao();
}, 500);

function checarVersao() {
    db.transaction(function (txn) {
        txn.executeSql("select versao_app from parametros", [],
        function (tx, res) {

            if (typeof networkState === 'undefined') {
                checaInfo(res.rows[0]);
            } else {
                checaInfo(res.rows._array[0]);
            }

        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function checaInfo(dados) {
    if (typeof dados !== 'undefined') {
        if (VERSAO === dados.versao_app) {
            console.log('Versão igual');
        } else {
            console.log('Nova versão. DropTable e Cria novamente');
            dropTable();
        }
    } else {
        console.log('Undefined');
    }
}

// VARIAVEIS UTILIZADAS DENTRO DO SOFTWARE
var produtos = [];
var dadosProduto = [];
var clientes = [];
var dadosCliente = [];
var todasVendas = [];
var selectProdutos = [];
var condicao = [];
var tipo = [];
var dadosEstadoCliente = [];
var parametros = [];
var decimal;
var dadosUser = [];
var valor_total_venda = [];
var dadosVenda = [];

document.addEventListener('backPage', function(){
    produtos = [];
    dadosProduto = [];
    //clientes = [];
    dadosCliente = [];
    dadosVenda = [];
    todasVendas = [];
    selectProdutos = [];
    condicao = [];
    tipo = [];
    dadosEstadoCliente = [];
    parametros = [];
    dadosUser = [];
    valor_total_venda = [];
});

var networkState = navigator.connection.type;
setTimeout(function() {
//    openPage('../pages/vendas');
//    openPage('../pages/processoVendas');
//    openPage('../pages/clientes_cadastro');
    openPage('../pages/clientes');
//    openPage('../pages/produtos');
    //openPage('../home');
}, 500);

var BASE_URL = 'http://192.168.1.33/projetos/WS_APP'; // localhost ingasoft
//var BASE_URL = 'http://200.150.122.150/WS_APP'; // externo eletroluz

//var BASE_URL = 'http://192.168.200.252:8182/WS_APP'; // localhost mix bicicletas
//var BASE_URL = 'http://mixbicicletas.ddns.net:8182/WS_APP'; // externo mix bicicletas

/* LOGIN */
function sincroniza(cod_vendedor_externo) {
    checkConnection();
      
    loading('Aguarde, estamos sincronizando os dados...');
    sincronizadorProdutos();

    sincronizadorParametros();
    sincronizadorNbmi();
    sincronizadorCondicaoPagamento();
    sincronizadorTipoPagamentos();
    sincronizadorEstados();

    setTimeout(function() {
        sincronizadorClientes(cod_vendedor_externo);
    }, 1000);
}

function sincronizadorUsuarios(apelido, senha, codigo, vendedor) {
    insertUsuarios(apelido, senha, codigo, 0, 1, vendedor);
}

//==== PARAMETROS
//sincronizadorParametros();
function sincronizadorParametros() {
    MobileUI.ajax.get(BASE_URL+'/getParametros/')
    .end(function (error, res) {
        if (error) {
            closeLoading();
            alert('Ops! Erro ao consultar dados da API (getParametros)!');
            return console.log(error);
        }
        
        var r = res.body;
        //console.log(res);
        deletarParametros();
        inserirParametros(r.CODIGO, r.ONLINE_PERM_DIG_DESCONTO, r.ONLINE_PERM_ALT_PRECOS, r.CALC_IMPOSTOS_NF, r.ESTADO, r.CASAS_DECIMAIS_VENDA, r.DESCONTO_MAXIMO, r.ACRESCIMO, r.COD_CONDPGTO_PADRAO);
    });
}

function inserirParametros(codigo, online_perm_dig_desconto, online_perm_alt_precos, calc_impostos_nf, estado, casas_decimais_venda, desconto_maximo, acrescimo, cod_condpgto_padrao) {
    //console.log('inserirParametros');
    db.transaction(function (txn) {
        txn.executeSql('insert into parametros (ref_codigo, online_perm_dig_desconto, online_perm_alt_precos, calc_impostos_nf, estado, casas_decimais_venda, desconto_maximo, condpgto_acrescimo, cod_condpgto_padrao, versao_app) values (?,?,?,?,?,?,?,?,?,?)', 
        [codigo, online_perm_dig_desconto, online_perm_alt_precos, calc_impostos_nf, estado, casas_decimais_venda, desconto_maximo, acrescimo, cod_condpgto_padrao, VERSAO],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function deletarParametros() {
    db.transaction(function (txn) {
        txn.executeSql('delete from parametros', [],
        function (tx, res) {
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}
//====

//==== NBMI
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
        deletarNbmi();
        for (var x=0; x<r.length; x++) {
            inserirNbmi(r[x].CODIGO, r[x].NCM, r[x].NBM, r[x].ST_AC, r[x].ST_AL, r[x].ST_AM, r[x].ST_AP, r[x].ST_BA, r[x].ST_CE, r[x].ST_DF, r[x].ST_ES, r[x].ST_EX, r[x].ST_GOI, r[x].ST_MA, r[x].ST_MG, r[x].ST_MS, r[x].ST_MT, r[x].ST_PA, r[x].ST_PB, r[x].ST_PE, r[x].ST_PI, r[x].ST_PR, r[x].ST_RJ, r[x].ST_RN, r[x].ST_RO, r[x].ST_RR, r[x].ST_RS, r[x].ST_SC, r[x].ST_SE, r[x].ST_SP, r[x].ST_TOC, r[x].ST_SN_AC, r[x].ST_SN_AL, r[x].ST_SN_AM, r[x].ST_SN_AP, r[x].ST_SN_BA, r[x].ST_SN_CE, r[x].ST_SN_DF, r[x].ST_SN_ES, r[x].ST_SN_GOI, r[x].ST_SN_MA, r[x].ST_SN_MG, r[x].ST_SN_MS, r[x].ST_SN_MT, r[x].ST_SN_PA, r[x].ST_SN_PB, r[x].ST_SN_PE, r[x].ST_SN_PI, r[x].ST_SN_PR, r[x].ST_SN_RJ, r[x].ST_SN_RN, r[x].ST_SN_RO, r[x].ST_SN_RR, r[x].ST_SN_RS, r[x].ST_SN_SC, r[x].ST_SN_SE, r[x].ST_SN_TOC, r[x].PERC_RED_ST, r[x].ICMS);
        }
    });
}

function inserirNbmi(codigo, ncm, nbm, st_ac, st_al, st_am, st_ap, st_ba, st_ce, st_df, st_es, st_ex, st_goi, st_ma, st_mg, st_ms, st_mt, st_pa, st_pb, st_pe, st_pi, st_pr, st_rj, st_rn, st_ro, st_rr, st_rs, st_sc, st_se, st_sp, st_toc, st_sn_ac, st_sn_al, st_sn_am, st_sn_ap, st_sn_ba, st_sn_ce, st_sn_df, st_sn_es, st_sn_goi, st_sn_ma, st_sn_mg, st_sn_ms, st_sn_mt, st_sn_pa, st_sn_pb, st_sn_pe, st_sn_pi, st_sn_pr, st_sn_rj, st_sn_rn, st_sn_ro, st_sn_rr, st_sn_rs, st_sn_sc, st_sn_se, st_sn_toc, perc_red_st, icms) {
    //console.log(codigo, ncm, nbm);
    db.transaction(function (txn) {
        txn.executeSql('insert into cad_nbmi (ref_codigo, ncm, nbm, st_ac, st_al, st_am, st_ap, st_ba, st_ce, st_df, st_es, st_ex, st_goi, st_ma, st_mg, st_ms, st_mt, st_pa, st_pb, st_pe, st_pi, st_pr, st_rj, st_rn, st_ro, st_rr, st_rs, st_sc, st_se, st_sp, st_toc, st_sn_ac, st_sn_al, st_sn_am, st_sn_ap, st_sn_ba, st_sn_ce, st_sn_df, st_sn_es, st_sn_goi, st_sn_ma, st_sn_mg, st_sn_ms, st_sn_mt, st_sn_pa, st_sn_pb, st_sn_pe, st_sn_pi, st_sn_pr, st_sn_rj, st_sn_rn, st_sn_ro, st_sn_rr, st_sn_rs, st_sn_sc, st_sn_se, st_sn_toc, perc_red_st, icms) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [codigo, ncm, nbm, st_ac, st_al, st_am, st_ap, st_ba, st_ce, st_df, st_es, st_ex, st_goi, st_ma, st_mg, st_ms, st_mt, st_pa, st_pb, st_pe, st_pi, st_pr, st_rj, st_rn, st_ro, st_rr, st_rs, st_sc, st_se, st_sp, st_toc, st_sn_ac, st_sn_al, st_sn_am, st_sn_ap, st_sn_ba, st_sn_ce, st_sn_df, st_sn_es, st_sn_goi, st_sn_ma, st_sn_mg, st_sn_ms, st_sn_mt, st_sn_pa, st_sn_pb, st_sn_pe, st_sn_pi, st_sn_pr, st_sn_rj, st_sn_rn, st_sn_ro, st_sn_rr, st_sn_rs, st_sn_sc, st_sn_se, st_sn_toc, perc_red_st, icms],
        function (tx, res) {
            //console.log(res);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
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
//====

//==== CONDIÇÃO PAGAMENTO
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
//====

//==== TIPO DE PAGAMENTOS
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

//==== ESTADOS
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
            inserirProdutos(x, r.length, r[x].CODIGO, r[x].DESCRICAO, r[x].ESTOQUEATUAL, r[x].PRECO_VENDA_A, r[x].PRECO_VENDA_A_ORIGINAL, r[x].PERCENTUAL_DESCONTO, r[x].PERCENTUAL_DESCONTO_ORIGINAL, r[x].ALIQUOTA_IPI, r[x].ALIQUOTA_IPI_ORIGINAL, r[x].REF_UNIDADE, r[x].DESCRICAO_UNIDADE, r[x].PROMOCIONAL, r[x].NBMIPI, r[x].ST, r[x].CUSTO_BRUTO, r[x].GRUPO);
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
                r[x].CALCULA_ST,
                r[x].CODIGO_VENDEDOR,
                r[x].VENDEDOR_EXTERNO,
                r[x].CONTRIBUINTE_ICMS,
                r[x].OPTANTE_SIMPLES,
                r[x].EMAIL_VENDEDOR,
                r[x].NOME_VENDEDOR
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

function inserirProdutos(inicio, final, ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original, percentual_desconto, percentual_desconto_original, aliquota_ipi, aliquota_ipi_original, ref_unidade, ref_unidade_descricao, promocional, nbmipi, st, custo_bruto, grupo) {
    //console.log(ref_codigo, descricao, estoqueatual, preco_venda_a);
    db.transaction(function (txn) {
        txn.executeSql('insert into produtos (ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original, percentual_desconto, percentual_desconto_original, aliquota_ipi, aliquota_ipi_original, ref_unidade, ref_unidade_descricao, promocional, nbmipi, st, custo_bruto, grupo) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [ref_codigo, descricao, estoqueatual, preco_venda_a, preco_venda_a_original, percentual_desconto, percentual_desconto_original, aliquota_ipi, aliquota_ipi_original, ref_unidade, ref_unidade_descricao, promocional, nbmipi, st, custo_bruto, grupo],
        function (tx, res) {
            if (inicio === (final -1)) {
                closeLoading();
                atualizarData();
                openPage('home');
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

function insertClientes(inicio, final, ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, calcula_st, codigo_vendedor, vendedor_externo, contribuinte_icms, optante_simples, email_vendedor, nome_vendedor) {
    db.transaction(function (txn) {
        txn.executeSql('insert into clientes (ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, calcula_st, codigo_vendedor, cod_vendedor_externo, contribuinte_icms, optante_simples, email_vendedor, nome_vendedor) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [ref_codigo, nome_fantasia, razao_social, natureza, cgc, inscricao, cpf, rg, cep, endereco, num_end_principal, comp_endereco, bairro, cidade, estado, telefone, celular, contato, transportadora, email, obs_cadastro, consumidor_final, calcula_st, codigo_vendedor, vendedor_externo, contribuinte_icms, optante_simples, email_vendedor, nome_vendedor],
        function (tx, res) {
            if (inicio === (final -1)) {
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
    // resolvi colocar neste formato para evitar de ficar tratando toda vez que for exibir a data em tela.
    // para transferir a venda basta formatar YYYY/MM/DD.
    if (dia < 10) {
        dia = '0' + dia;
    }

    var str_data = dia +'/'+ (mes+1) +'/'+ ano4;

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

    //loadingElement('btn-validar', 'Validando...');
    var usuario = document.getElementById('usuario').value.toUpperCase();
    var senha = document.getElementById('senha').value.toUpperCase();

    if (!usuario) {
        alerta('Usuário.', 'Ops! Usuário não pode ser vazio.');
        //closeLoading('btn-validar');
        return false;
    }

    if (!senha) {
        alerta('Senha.', 'Ops! Senha não pode ser vazia.');
        //closeLoading('btn-validar');
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