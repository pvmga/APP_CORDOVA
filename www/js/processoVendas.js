function aliquotaEstado(estado) {
    db.transaction(function (txn) {
        txn.executeSql("select * from estados where sigla_estado = ?", [estado],
        function (tx, res) {
            if (typeof networkState === 'undefined') {
                dadosEstadoCliente = res.rows[0];
            } else {
                dadosEstadoCliente = res.rows._array[0];
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function parametroSoftware() {
    db.transaction(function (txn) {
        txn.executeSql("select * from parametros", [],
        function (tx, res) {

            if (typeof networkState === 'undefined') {
                preencheParametros(res.rows[0]);
            } else {
                preencheParametros(res.rows._array[0]);
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function preencheParametros(param) {
    parametros = param;

    if (param.online_perm_dig_desconto === 'N') {
        $('.tabela-produtos .item div .row .desconto #percentual_desconto').attr('disabled', true);
    }

    if (param.online_perm_dig_desconto === 'N') {
        $('.tabela-produtos .item div .row .valor #valor_unitario_produto_original').attr('disabled', true);
    }
    
    if (param.casas_decimais_venda === 'S') {
        decimal = 100;
    } else {
        decimal = 1000;
    }
}

function usuarioVenda() {
    db.transaction(function (txn) {
        txn.executeSql("select * from usuarios", [],
        function (tx, res) {
            //console.log(res.rows[0]);
            if (typeof networkState === 'undefined') {
                dadosUser = res.rows[0];
            } else {
                dadosUser = res.rows._array[0];
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function selectCliente(params) {
    
    document.getElementById('codigoCliente').value = params.codigo;
    document.getElementById('refCodigoCliente').value = params.ref_codigo;
    document.getElementById('nomeCliente').textContent = params.nome_cliente;

    //document.getElementById('estadoCliente').textContent = params.estado;
    document.getElementById('optanteSimples').textContent = params.optante_simples;
    document.getElementById('calculaSt').textContent = params.calcula_st;
    document.getElementById('codigoVendedor').textContent = params.codigo_vendedor;

    // guardar dados para utilizar na inserção de produtos;
    aliquotaEstado(params.estado);
    // parametro
    parametroSoftware();
    // dados user
    usuarioVenda();

    // VERIFICAR EXISTÊNCIA DE VENDA
    existeVenda(params.codigo);
    
    loading('Aguarde, estamos sincronizando os dados...');
    setTimeout(function() {
        select2CondPagamento();
        select2TipoPagamento();
    }, 500);
}

function verificaDesconto(percDescontoDigitado, percDescontoOriginal, valor_unitario_digitado, valor_unitario_backup) {

    var divisao = (100 - ((valor_unitario_digitado / valor_unitario_backup) * 100)).toFixed(2);
    var total_desconto = (parseFloat(divisao) + parseFloat(percDescontoDigitado)).toFixed(2);

    //console.log(divisao, percDescontoDigitado, percDescontoOriginal, valor_unitario_digitado, valor_unitario_backup);

    if (percDescontoDigitado !== '0.00' || parametros.desconto_maximo !== '0.00') {
        if (total_desconto > percDescontoOriginal) {
            if (total_desconto > parametros.desconto_maximo) {
                return '0';
            }
        }
    }
}

function verificarProduto(codigoProduto) {

    var produtosInseridos = document.querySelectorAll('.ref_codigo_produto_inserido');
    var codigoCliente = document.getElementById('codigoCliente').value;

    for (var i=0; i<produtosInseridos.length; i++) {
        if (produtosInseridos[i].innerText === codigoProduto) {
            //console.log(produtosInseridos[i].innerText === codigoProduto);
            //console.log('Entrou novo e será deletado o antigo');
            db.transaction(function (txn) {
                txn.executeSql("delete from itensven where cod_clie = "+codigoCliente+" and cod_produto = "+codigoProduto, [],
                function (tx, res) {
                    console.log('Produto removido');
                }, function (tx, error) {
                    console.log(error);
                    return false;
                });
            });
        }
    }
}

function add(codigoProduto, descricao) {
    var todosProdutosListado = document.querySelectorAll('.tabela-produtos .item .ref_codigo_produto');
    
    for (var x=0; x<todosProdutosListado.length; x++) {
        if (todosProdutosListado[x].innerText == codigoProduto) {
            var percentual_desconto = document.querySelectorAll('.tabela-produtos .item div .row .desconto input.percentual_desconto')[x].value;
            var percentual_desconto_original = document.querySelectorAll('.tabela-produtos .item div .row .desconto input.percentual_desconto_original')[x].value;
            var valor_unitario_produto = document.querySelectorAll('.tabela-produtos .item div .row .valor input.valor_unitario_produto')[x].value;
            var valor_unitario_produto_backup = document.querySelectorAll('.tabela-produtos .item div .row .valor input.valor_unitario_produto_backup')[x].value;
                    
            if (verificaDesconto(percentual_desconto.replace(',', '.'), percentual_desconto_original.replace(',', '.'), valor_unitario_produto.replace(',', '.'), valor_unitario_produto_backup.replace(',', '.')) === '0') {
                alert('Desconto ultrapassou o limite permitido');
                return false;
            }

            // verifica existência
            verificarProduto(codigoProduto);

            // LIMPA LISTAGEM PRODUTO
            selectProdutos = [];

            $('#listagem_produtos_adicionado').removeClass('hidden');

            // PARA NÃO CONSEGUIR ALTERAR CONDIÇÃO DE PAGAMENTO APÓS INSERIDO 1 PRODUTO;
            // CASO PERMITA O USUÁRIO REALIZAR ESSE PROCESSO, DEVERÁ CRIAR UMA RÓTINA DE RECALCULO DE ACRESCIMO;
            disabledCondicaoPagamento();

            var quantidade_digitada = document.querySelectorAll('.tabela-produtos .item div .row .quantidade input.quantidade_digitada')[x].value;
            var aliquota_ipi_original = document.querySelectorAll('.tabela-produtos .item div .row .valor input.aliquota_ipi_original')[x].value;
            var percentual_acrescimo = document.querySelectorAll('.tabela-produtos .item div .row .valor input.percentual_acrescimo')[x].value;
            var cod_grupo = document.querySelectorAll('.tabela-produtos .item div .row .valor input.cod_grupo')[x].value;
            var custo_bruto = document.querySelectorAll('.tabela-produtos .item div .row .valor input.custo_bruto')[x].value;
            var valor_unitario_produto_original = document.querySelectorAll('.tabela-produtos .item div .row .valor input.valor_unitario_produto_original')[x].value;
            var itens = {
                'codigo_produto': codigoProduto,
                'descricao': descricao,
                'quantidade_digitada': parseInt(quantidade_digitada),
                'percentual_desconto': (percentual_desconto == '') ? 0 : parseFloat((percentual_desconto).replace(',', '.')),
                'valor_unitario_produto': parseFloat((valor_unitario_produto).replace(',', '.')),
                'valor_unitario_produto_original': parseFloat((valor_unitario_produto_original).replace(',', '.')),
                'aliquota_ipi_original': parseFloat(aliquota_ipi_original),
                'percentual_acrescimo': (percentual_acrescimo === '') ? 0 : parseFloat(percentual_acrescimo),
                'cod_grupo': cod_grupo,
                'custo_bruto': parseFloat(custo_bruto)
            }
            //console.log(itens);
            percentualNbmi(itens);
            return false;
        }
    }
}

function percentualNbmi(itens) {
    var sql = "SELECT \
                (CASE '"+dadosEstadoCliente.sigla_estado+"' \
                WHEN 'AC' THEN cad_nbmi.st_ac  \
                WHEN 'AL' THEN cad_nbmi.st_al  \
                WHEN 'AM' THEN cad_nbmi.st_am  \
                WHEN 'AP' THEN cad_nbmi.st_ap  \
                WHEN 'BA' THEN cad_nbmi.st_ba  \
                WHEN 'CE' THEN cad_nbmi.st_ce  \
                WHEN 'DF' THEN cad_nbmi.st_df  \
                WHEN 'ES' THEN cad_nbmi.st_es  \
                WHEN 'EX' THEN cad_nbmi.st_ex  \
                WHEN 'MA' THEN cad_nbmi.st_ma  \
                WHEN 'MG' THEN cad_nbmi.st_mg  \
                WHEN 'MS' THEN cad_nbmi.st_ms  \
                WHEN 'MT' THEN cad_nbmi.st_mt  \
                WHEN 'PA' THEN cad_nbmi.st_pa  \
                WHEN 'PB' THEN cad_nbmi.st_pb  \
                WHEN 'PE' THEN cad_nbmi.st_pe  \
                WHEN 'PI' THEN cad_nbmi.st_pi  \
                WHEN 'PR' THEN cad_nbmi.st_pr  \
                WHEN 'RJ' THEN cad_nbmi.st_rj  \
                WHEN 'RN' THEN cad_nbmi.st_rn  \
                WHEN 'RO' THEN cad_nbmi.st_ro  \
                WHEN 'RR' THEN cad_nbmi.st_rr  \
                WHEN 'RS' THEN cad_nbmi.st_rs  \
                WHEN 'SC' THEN cad_nbmi.st_sc  \
                WHEN 'SE' THEN cad_nbmi.st_se  \
                WHEN 'SP' THEN cad_nbmi.st_sp  \
                WHEN 'TO' THEN cad_nbmi.st_toc \
                WHEN 'GO' THEN cad_nbmi.st_goi \
                \
                ELSE 0.00 \
                \
                END) perc_nbmi, \
            (CASE '"+dadosEstadoCliente.sigla_estado+"' \
                WHEN 'AC' THEN cad_nbmi.st_sn_ac \
                WHEN 'AL' THEN cad_nbmi.st_sn_al \
                WHEN 'AM' THEN cad_nbmi.st_sn_am \
                WHEN 'AP' THEN cad_nbmi.st_sn_ap \
                WHEN 'BA' THEN cad_nbmi.st_sn_ba \
                WHEN 'CE' THEN cad_nbmi.st_sn_ce \
                WHEN 'DF' THEN cad_nbmi.st_sn_df \
                WHEN 'ES' THEN cad_nbmi.st_sn_es \
                WHEN 'MA' THEN cad_nbmi.st_sn_ma \
                WHEN 'MG' THEN cad_nbmi.st_sn_mg \
                WHEN 'MS' THEN cad_nbmi.st_sn_ms \
                WHEN 'MT' THEN cad_nbmi.st_sn_mt \
                WHEN 'PA' THEN cad_nbmi.st_sn_pa \
                WHEN 'PB' THEN cad_nbmi.st_sn_pb \
                WHEN 'PE' THEN cad_nbmi.st_sn_pe \
                WHEN 'PI' THEN cad_nbmi.st_sn_pi \
                WHEN 'PR' THEN cad_nbmi.st_sn_pr \
                WHEN 'RJ' THEN cad_nbmi.st_sn_rj \
                WHEN 'RN' THEN cad_nbmi.st_sn_rn \
                WHEN 'RO' THEN cad_nbmi.st_sn_ro \
                WHEN 'RR' THEN cad_nbmi.st_sn_rr \
                WHEN 'RS' THEN cad_nbmi.st_sn_rs \
                WHEN 'SC' THEN cad_nbmi.st_sn_sc \
                WHEN 'SE' THEN cad_nbmi.st_sn_se \
                WHEN 'SP' THEN cad_nbmi.st_sn_sp \
                WHEN 'TO' THEN cad_nbmi.st_sn_toc \
                WHEN 'GO' THEN cad_nbmi.st_sn_goi \
                    \
                    ELSE 0.00 \
                END) perc_sn, \
                produtos.st, \
                cad_nbmi.icms, \
                cad_nbmi.perc_red_st\
            FROM produtos \
            LEFT JOIN cad_nbmi ON (produtos.nbmipi = cad_nbmi.ref_codigo) \
            \
            WHERE produtos.ref_codigo = "+itens.codigo_produto;

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            if (typeof networkState === 'undefined') {
                insertItens(itens, res.rows[0]);
            } else {
                insertItens(itens, res.rows._array[0]);
            }

        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function listaProdutosVenda(dados) {

    //console.log(dados);

    // LIMPA PRODUTOS QUE JÁ ESTÃO NA VENDA;
    dadosProduto = [];
    valor_total_venda = [];

    if (typeof dados[0] === 'undefined') {
        // Nova VENDA (INSERT)
        insertVenda();
        return false;
    }
    
    $('.select2CondPagamento option:selected').val(dados[0].cod_pagamento);
    $('.select2CondPagamento option:selected').text(dados[0].descricao_cond);
    $('.select2TipoPagamento option:selected').val(dados[0].tipo_pagamento);
    $('.select2TipoPagamento option:selected').text(dados[0].descricao_tipo);

    var sql = "select * from itensven where cod_clie = "+dados[0].cod_clie;

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            var valor_total_venda_calc = 0;
            var valor_total_ipi_st_calc = 0;
            var valor_total_produtos_calc = 0;
            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    valor_total_venda_calc += parseFloat((res.rows[i].valor_total).replace(',', '.'));
                    valor_total_ipi_st_calc += parseFloat((res.rows[i].st_ipi));
                    valor_total_produtos_calc += parseFloat((res.rows[i].valor_unit_liq));

                    //console.log(res.rows[i]);
                    // PARA NÃO CONSEGUIR ALTERAR CONDIÇÃO DE PAGAMENTO APÓS INSERIDO 1 PRODUTO;
                    // CASO PERMITA O USUÁRIO REALIZAR ESSE PROCESSO, DEVERÁ CRIAR UMA RÓTINA DE RECALCULO DE ACRESCIMO;
                    disabledCondicaoPagamento();
                    dadosProduto.push(res.rows[i]);
                } else {
                    valor_total_venda_calc += parseFloat((res.rows._array[i].valor_total).replace(',', '.'));
                    valor_total_ipi_st_calc += parseFloat((res.rows._array[i].st_ipi));
                    valor_total_produtos_calc += parseFloat((res.rows._array[i].valor_unit_liq));

                    disabledCondicaoPagamento();
                    dadosProduto.push(res.rows._array[i]);
                }
            }
            
            valor_total_venda.push({ 
                valor_total: (Math.round((valor_total_venda_calc) * 100) / 100).toString().replace('.', ','),
                valor_st_ipi: (Math.round((valor_total_ipi_st_calc) * 100) / 100).toString().replace('.', ','),
                valor_produtos: (Math.round((valor_total_produtos_calc) * 100) / 100).toString().replace('.', ',')
            });

            //console.log(valor_total_venda);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertItens(dados, nbmi) {
    //console.log(dados, nbmi);
        
    var codigoCliente = document.getElementById('codigoCliente').value;

    var cod_produto = dados.codigo_produto;
    var descricao_produto = dados.descricao;
    var unidade = 'UN';
    var valor_unitario =  dados.valor_unitario_produto;
    var percentual_desconto = dados.percentual_desconto;
    var percentual_acrescimo = dados.percentual_acrescimo; // a verificar
    var quantidade_estoque_digitado = dados.quantidade_digitada;
    var aliquota_ipi = dados.aliquota_ipi_original; // a verificar
    var cod_grupo = dados.cod_grupo;
    var custo_bruto = dados.custo_bruto;
    var valor_unitario_original = dados.valor_unitario_produto_original;
    
    // calculo desconto;
    var valor_com_desconto = (calculoDescOuAcres(dados.valor_unitario_produto, dados.percentual_desconto, '-'));

    // valor x quantidade
    var valor_total = Math.round((valor_com_desconto * dados.quantidade_digitada) * 100) / 100;
    //console.log(valor_total, valor_com_desconto , dados.quantidade_digitada);

    calcula_st = document.getElementById('calculaSt').textContent;
    estado = document.getElementById('estadoCliente').textContent;
    optante_simples = document.getElementById('optanteSimples').textContent;

    //console.log(valor_total);
    var vlr_bkp = valor_total;
    valor_total = retornaImposto(valor_total, optante_simples, parametros, decimal, calcula_st, aliquota_ipi, nbmi);
    var st_ipi = Math.round((valor_total - vlr_bkp) * 100) / 100;

    db.transaction(function (txn) {
        txn.executeSql("insert into itensven (cod_clie, cod_produto, valor_unitario, percentual_desconto, percentual_acrescimo, quantidade, valor_total, descricao_produto, unidade, aliquota_ipi, cod_grupo, custo_bruto, valor_unitario_original, st_ipi, valor_unit_liq) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [codigoCliente, cod_produto, valor_unitario.toString().replace('.', ','), percentual_desconto, percentual_acrescimo, quantidade_estoque_digitado, valor_total.toString().replace('.', ','), descricao_produto, unidade, aliquota_ipi, cod_grupo, custo_bruto, valor_unitario_original.toString().replace('.', ','), st_ipi, vlr_bkp],
        function (tx, res) {
            //console.log(codigoCliente);
            existeVenda(codigoCliente);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function retornaImposto(valor_total, optante_simples, parametros, decimal, calcula_st, aliquota_ipi, nbmi) {
    var valor_total;
    var valor_1 = 0;
    var valor_2 = 0;
    var valor_3 = 0;
    var valor_4 = 0;
    var aliquotaExterna;
    var aliquotaInterna;
    var percNBMI;

    // calculo ipi
    var valor_total_st = Math.round((valor_total + (valor_total * (aliquota_ipi / 100))) * 100) / 100;

    // calculo st
    if (dadosEstadoCliente.optante_st == 'N') {
        valor_4 = 0;
    } else {
        if ((((nbmi.st).substr(1,2) === '60') && ((parametros.estadoEmpresa === dadosEstadoCliente.sigla_estado) || (calcula_st === 'N'))) || (((nbmi.st).substr(1,2) != '10' && (nbmi.st).substr(1,2) !== '30' && (nbmi.st).substr(1,2) !== '60' && (nbmi.st).substr(1,2) !== '70')) || (calcula_st === 'N')) {
            valor_4 = 0;
        } else {
            //console.log('continua calculando st');
            if ((nbmi.st).substr(0, 1) === '1' || (nbmi.st).substr(0, 1) === '2') {
                aliquotaExterna = dadosEstadoCliente.imp_aliquota_externa_icms;
                aliquotaInterna = dadosEstadoCliente.imp_aliquota_interna_icms;
            } else {
                if (nbmi.icms > 0 && dadosEstadoCliente.sigla_estado === parametros.estadoEmpresa) {

                    aliquotaExterna = nbmi.icms;
                    aliquotaInterna = nbmi.icms;
                } else {

                    if ((nbmi.st === '100') || (nbmi.st === '160')) {
                        aliquotaExterna = 4;
                    } else {
                        aliquotaExterna = dadosEstadoCliente.aliquota_externa_icms;
                    }

                    aliquotaInterna = dadosEstadoCliente.aliquota_interna_icms;
                }
            }

            percNBMI = nbmi.perc_nbmi;
            var perc_sn = parseFloat(nbmi.perc_sn);
            var perc_nbmi = parseFloat(nbmi.perc_nbmi);
            if (optante_simples === 'S') {
                percNBMI = (perc_sn > 0) ? (perc_nbmi * (perc_sn / 100)) : perc_nbmi;
            }

            if (parametros.calc_impostos_nf === 'S') {
                percNBMI = (((((percNBMI / 100) + 1) * ((aliquotaInterna / 100) - 1) / ((aliquotaExterna / 100) - 1)) - 1) * 100, 2).replace('.', '');
            }

            if (percNBMI !== '' && percNBMI !== 0) {
                valor_1 = Math.round(((valor_total * aliquotaExterna) / 100) * 100) / 100;
                valor_2 = Math.round((((valor_total_st * percNBMI) / 100) + valor_total_st) * 100) / 100;
                if (dadosEstadoCliente.sigla_estado === parametros.estadoEmpresa) {
                    valor_2 = Math.round((valor_2 - (valor_2 * (nbmi.perc_red_st / 100))) * 100) / 100;
                }
                valor_3 = Math.round(((valor_2 * aliquotaInterna) / 100) * 100) / 100;
                valor_4 = Math.round((valor_3 - valor_1) * 100) / 100;
            }
        }
    }

    //console.log(valor_total_st, valor_4, ((valor_total_st + valor_4) - valor_total));

    valor_total_st = valor_total_st + valor_4;
    return Math.round((valor_total_st) * decimal) / decimal;
}

// BUSCA PRODUTOS
function busca() {

    selectProdutos = [];
    var pesquisa = $('#campoPesquisaProdVenda').val();

    var cond_pagamento = $('.select2CondPagamento option:selected').val();
    if (cond_pagamento === '') {
        alert('Provisoriamente será necessário escolher condição de pagamento antes da inclusão de qualquer produto.');
        return false;
    }
    db.transaction(function (txn) {
        txn.executeSql("select * from condicao where ref_codigo = ?", [cond_pagamento],
        function (tx, res) {
            //console.log(res);
            if (typeof networkState === 'undefined') {
                if (res.rows.length > 0) {
                    $('#percentualAcrescimo').val(res.rows[0].acrescimo);
                } else {
                    $('#percentualAcrescimo').val(0);
                }
            } else {
                if (res.rows._array.length > 0) {
                    $('#percentualAcrescimo').val(res.rows._array[0].acrescimo);
                } else {
                    $('#percentualAcrescimo').val(0);
                }
            }
        }, function (tx, error) {
            closeLoading();
            console.log(error);
            return false;
        });
    });

    db.transaction(function (txn) {
        txn.executeSql("select * from produtos where descricao like '%"+pesquisa+"%' or ref_codigo like '"+pesquisa+"%' limit 29", [],
        function (tx, res) {
            if (typeof networkState === 'undefined') {
                listarProdutos(res.rows);
            } else {
                listarProdutos(res.rows._array);
            }

        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function listarProdutos(dados) {
    //console.log(dados[0]);

    for(var i=0; i<dados.length; i++) {
        
        var preco_a_parse;
        var preco_venda_a;
        var percentual_acrescimo;
        var preco_venda_a_original;

        percentual_acrescimo = parseFloat($('#percentualAcrescimo').val());

        // CALCULAR ACRESCIMO
        percentual_acrecimo = (percentual_acrescimo !== null) ? percentual_acrescimo : 0;
        preco_a_parse = parseFloat(dados[i].preco_venda_a_original);
        preco_venda_a = (calculoDescOuAcres(preco_a_parse, percentual_acrecimo, '+'));
        preco_venda_a_original = Math.round((dados[i].preco_venda_a_original) * 1000) / 1000;

        var itens = {
            ref_codigo: dados[i].ref_codigo,
            descricao: dados[i].descricao,
            preco_venda_a_original: (preco_venda_a_original).toString().replace('.', ','),
            preco_venda_a: (preco_venda_a).toString().replace('.', ','), // LISTAGEM
            percentual_desconto: dados[i].percentual_desconto, // LISTAGEM
            percentual_desconto_original: dados[i].percentual_desconto,
            percentual_acrescimo: percentual_acrescimo, // LISTAGEM
            aliquota_ipi_original: dados[i].aliquota_ipi_original, // LISTAGEM
            cod_grupo: dados[i].grupo, // LISTAGEM
            custo_bruto: dados[i].custo_bruto, // LISTAGEM
        };
        //console.log(itens);
        selectProdutos.push(itens);
    }

    $('#listagem_produtos_adicionado').addClass('hidden');
}

function existeVenda(codigo) {

    var sql = "select v.*, c.descricao as descricao_cond, t.descricao as descricao_tipo \
    from venda v \
    left join condicao c on(v.cod_pagamento = c.ref_codigo) \
    left join tipo t on(v.tipo_pagamento = t.sigla)\
    where v.sincronizado = 'N' and v.cod_clie = "+codigo+" order by v.cod_venda desc limit 1";

    db.transaction(function (txn) {
        txn.executeSql(sql, [],
        function (tx, res) {
            //console.log(res);
            if (typeof networkState === 'undefined') {
                listaProdutosVenda(res.rows);
            } else {
                listaProdutosVenda(res.rows._array);
            }
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertVenda(tp) {

    var cod_clie = $('#codigoCliente').val();
    var cond_pagamento = $('.select2CondPagamento option:selected').val();
    var tipo_pagamento = $('.select2TipoPagamento option:selected').val();
    var informacoes = '';
    var sql = '';
    var msg = '';

    if (cond_pagamento === '') {
        cond_pagamento = parametros.cod_condpgto_padrao;
    }

    if (tp === 'up') {
        sql = "update venda set cod_pagamento = ?, tipo_pagamento = ? where cod_clie = "+cod_clie;
        informacoes = [cond_pagamento, tipo_pagamento];
        msg = 'UPDATE VENDA';
    } else {
        sql = "insert into venda (cod_clie, cod_pagamento, tipo_pagamento, total_venda, sincronizado) values (?,?,?,?,?)";
        informacoes = [cod_clie, cond_pagamento, tipo_pagamento, 0, 'N'];
        msg = 'Adicionado venda para este cliente';
    }

    db.transaction(function (txn) {
        txn.executeSql(sql, informacoes,
        function (tx, res) {
            console.log(msg);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function select2CondPagamento() {

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
            closeLoading();
            console.log(error);
            return false;
        });
    });
}

function select2TipoPagamento() {

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
            closeLoading();
        }, function (tx, error) {
            closeLoading();
            console.log(error);
            return false;
        });
    });
}

function calculoDescOuAcres(vlr, perc, opc) {
    var valor;
    if (opc === '-') {
        valor = Math.round((vlr - (vlr * (perc / 100))) * 1000) / 1000;
    } else {
        valor = Math.round((vlr + (vlr * (perc / 100))) * 1000) / 1000;
    }

    return valor;
}

function confirmaDelecaoProduto(codigoProduto) {
    alert({
        id: 'alert-exclusao',
        title:'Alerta !',
        message: 'Deseja realmente deletar o produto. <br /> <b>Codigo:</b> ' + codigoProduto,
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
                    deletarProduto(codigoProduto)
                }
            }
        ]
    });
}
function deletarProduto(codigoProduto) {
    
    var codigoCliente = $('#codigoCliente').val();

    var sql = "delete from itensven where cod_produto = ? and cod_clie = ?";

    db.transaction(function (txn) {
        txn.executeSql(sql, [codigoProduto, codigoCliente],
        function (tx, res) {
            existeVenda(codigoCliente);
            closeAlert('alert-exclusao');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function disabledCondicaoPagamento() {
    $('.select2CondPagamento').attr('disabled', true);
}

MobileUI.preencherMask = function(v) {
    $(".valor_unitario_produto").mask("9999,999");
    $('.percentual_desconto').mask('99,99');
}