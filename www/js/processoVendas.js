function selectCliente(params) {
    
    document.getElementById('codigoCliente').value = params.codigo;
    document.getElementById('nomeCliente').textContent = params.nome_cliente;

    document.getElementById('estadoCliente').textContent = params.estado;
    document.getElementById('optanteSimples').textContent = params.optante_simples;
    document.getElementById('calculaSt').textContent = params.calcula_st;

    // VERIFICAR EXISTÊNCIA DE VENDA
    existeVenda(params.codigo);
    
    loading('Aguarde, estamos sincronizando os dados...');
    setTimeout(function() {
        select2CondPagamento();
        select2TipoPagamento();
    }, 500);
}

function verificarProduto(codigoProduto, descricao) {

    var produtosInseridos = document.querySelectorAll('.ref_codigo_produto_inserido');
    var codigoCliente = document.getElementById('codigoCliente').value;

    // timeout com intuito de melhorar a experiência do usuário.
    setTimeout(function() {
        for (var i=0; i<produtosInseridos.length; i++) {
            if (produtosInseridos[i].innerText === codigoProduto) {
                //console.log(produtosInseridos[i].innerText === codigoProduto);
                console.log('Entrou novo e será deletado o antigo');
                db.transaction(function (txn) {
                    txn.executeSql("delete from itensven where cod_clie = "+codigoCliente+" and cod_produto = "+codigoProduto, [],
                    function (tx, res) {
                        add(codigoProduto, descricao);
                    }, function (tx, error) {
                        console.log(error);
                        return false;
                    });
                });
                return false;
            } else if (i == (produtosInseridos.length - 1)) {
                // GARANTIR QUE SÓ IRÁ EXECUTAR AO FINALIZAR TODA VERIFICAÇÃO
                //add(codigoProduto, descricao);
            }
        }
        add(codigoProduto, descricao);
    }, 100);
}

function add(codigoProduto, descricao) {
    // LIMPA LISTAGEM PRODUTO
    selectProdutos = [];

    var todosProdutosListado = document.querySelectorAll('.tabela-produtos .item .ref_codigo_produto');
    
    for (var x=0; x<todosProdutosListado.length; x++) {
        if (todosProdutosListado[x].innerText == codigoProduto) {

            $('#listagem_produtos_adicionado').removeClass('hidden');

            // PARA NÃO CONSEGUIR ALTERAR CONDIÇÃO DE PAGAMENTO APÓS INSERIDO 1 PRODUTO;
            // CASO PERMITA O USUÁRIO REALIZAR ESSE PROCESSO, DEVERÁ CRIAR UMA RÓTINA DE RECALCULO DE ACRESCIMO;
            disabledCondicaoPagamento();

            var quantidade_digitada = document.querySelectorAll('.tabela-produtos .item div .row .quantidade input.quantidade_digitada')[x].value;
            var percentual_desconto = document.querySelectorAll('.tabela-produtos .item div .row .desconto input.percentual_desconto')[x].value;
            var valor_unitario_produto = document.querySelectorAll('.tabela-produtos .item div .row .valor input.valor_unitario_produto')[x].value;
            var aliquota_ipi_original = document.querySelectorAll('.tabela-produtos .item div .row .valor input.aliquota_ipi_original')[x].value;
            var percentual_acrescimo = document.querySelectorAll('.tabela-produtos .item div .row .valor input.percentual_acrescimo')[x].value;
            var itens = {
                'codigo_produto': codigoProduto,
                'descricao': descricao,
                'quantidade_digitada': parseInt(quantidade_digitada),
                'percentual_desconto': (percentual_desconto == '') ? '00.00' : parseFloat((percentual_desconto).replace(',', '.')),
                'valor_unitario_produto': parseFloat((valor_unitario_produto).replace(',', '.')),
                'aliquota_ipi_original': parseFloat(aliquota_ipi_original),
                'percentual_acrescimo': parseFloat(percentual_acrescimo),
            }

            insertItens(itens);
            return false;
        }
    }
}

function existeVenda(codigo) {

    var sql = "select v.*, c.descricao as descricao_cond, t.descricao as descricao_tipo \
    from venda v \
    left join condicao c on(v.cod_pagamento = c.ref_codigo) \
    left join tipo t on(v.tipo_pagamento = t.ref_codigo)\
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

function updateVenda() {

    var codigoCliente = $('#codigoCliente').val();
    var cond_pagamento = $('.select2CondPagamento option:selected').val();
    var tipo_pagamento = $('.select2TipoPagamento option:selected').val();

    var sql = "update venda set cod_pagamento = ?, tipo_pagamento = ? where cod_clie = "+codigoCliente;

    db.transaction(function (txn) {
        txn.executeSql(sql, [cond_pagamento, tipo_pagamento],
        function (tx, res) {
            console.log('UPDATE VENDA');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function listaProdutosVenda(dados) {

    //console.log(dados);

    // LIMPA PRODUTOS QUE JÁ ESTÃO NA VENDA;
    dadosProduto = []

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
            //console.log('PREENCHER DADOS (GET)');

            for(var i=0; i<res.rows.length; i++) {
                if (typeof networkState === 'undefined') {
                    // PARA NÃO CONSEGUIR ALTERAR CONDIÇÃO DE PAGAMENTO APÓS INSERIDO 1 PRODUTO;
                    // CASO PERMITA O USUÁRIO REALIZAR ESSE PROCESSO, DEVERÁ CRIAR UMA RÓTINA DE RECALCULO DE ACRESCIMO;
                    disabledCondicaoPagamento();
                    dadosProduto.push(res.rows[i]);
                } else {
                    dadosProduto.push(res.rows._array[i]);
                }
            }

        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertVenda() {

    var cod_clie = $('#codigoCliente').val();
    var cond_pagamento = $('.select2CondPagamento option:selected').val();
    var tipo_pagamento = $('.select2TipoPagamento option:selected').val();

    db.transaction(function (txn) {
        txn.executeSql("insert into venda (cod_clie, cod_pagamento, tipo_pagamento, total_venda, sincronizado) values (?,?,?,?,?)",
        [cod_clie, cond_pagamento, tipo_pagamento, 50, 'N'],
        function (tx, res) {
            console.log('Adicionado venda para este cliente');
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function insertItens(dados) {
    //console.log(dados);
    
    var codigoCliente = document.getElementById('codigoCliente').value;

    var cod_produto = dados.codigo_produto;
    var descricao_produto = dados.descricao;
    var unidade = 'UN';
    var valor_unitario =  dados.valor_unitario_produto;
    var percentual_desconto = dados.percentual_desconto;
    var percentual_acrescimo = dados.percentual_acrescimo; // a verificar
    var quantidade_estoque_digitado = dados.quantidade_digitada;
    var aliquota_ipi = dados.aliquota_ipi_original; // a verificar

    // calculo desconto;
    var valor_com_desconto = Math.round(calculoDescOuAcres(dados.valor_unitario_produto, dados.percentual_desconto, '-') * 1000) / 1000;
    var valor_total = Math.round((valor_com_desconto * dados.quantidade_digitada) * 1000) / 1000;

    //valor_total = $this->retornaImposto($preco_venda_a, $produto['CODIGO'], $estado_cliente, $optante_simples_cliente, $parametros, $decimal, $calcula_st, $produto['ALIQUOTAIPIVENDA'], $desconsidera_ipi);
    calcula_st = document.getElementById('calculaSt').textContent;
    estado = document.getElementById('estadoCliente').textContent;
    optante_simples = document.getElementById('optanteSimples').textContent;
    valor_total = retornaImposto(valor_total, cod_produto, estado, optante_simples, 'PARAMETROS', 1000, calcula_st, aliquota_ipi);

    db.transaction(function (txn) {
        txn.executeSql("insert into itensven (cod_clie, cod_produto, valor_unitario, percentual_desconto, percentual_acrescimo, quantidade, valor_total, descricao_produto, unidade, aliquota_ipi) values (?,?,?,?,?,?,?,?,?,?)",
        [codigoCliente, cod_produto, valor_unitario.toString().replace('.', ','), percentual_desconto, percentual_acrescimo, quantidade_estoque_digitado, valor_total.toString().replace('.', ','), descricao_produto, unidade, aliquota_ipi],
        function (tx, res) {
            //console.log(codigoCliente);
            existeVenda(codigoCliente);
        }, function (tx, error) {
            console.log(error);
            return false;
        });
    });
}

function retornaImposto(valor_total, cod_produto, estado, optante_simples, parametros, decimal, calcula_st, aliquota_ipi) {
    console.log(valor_total, cod_produto, estado, optante_simples, parametros, decimal, calcula_st, aliquota_ipi);
    var valor_total;
    // calculo ipi
    valor_total = Math.round(calculoDescOuAcres(valor_total, aliquota_ipi, '+') * 100) / 100;
    return valor_total;
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

        percentual_acrescimo = parseFloat($('#percentualAcrescimo').val());

        // CALCULAR ACRESCIMO
        percentual_acrecimo = (percentual_acrescimo !== null) ? percentual_acrescimo : 0;
        preco_a_parse = parseFloat(dados[i].preco_venda_a_original);
        preco_venda_a = calculoDescOuAcres(preco_a_parse, percentual_acrecimo, '+');

        var itens = {
            ref_codigo: dados[i].ref_codigo,
            descricao: dados[i].descricao,
            preco_venda_a: (preco_venda_a).toString().replace('.', ','), // LISTAGEM
            percentual_desconto: dados[i].percentual_desconto, // LISTAGEM
            percentual_acrescimo: percentual_acrescimo, // LISTAGEM
            aliquota_ipi_original: dados[i].aliquota_ipi_original, // LISTAGEM
        };
        //console.log(itens);
        selectProdutos.push(itens);
    }

    $('#listagem_produtos_adicionado').addClass('hidden');
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
        valor = (vlr - (vlr * (perc / 100)));
    } else {
        valor = (vlr + (vlr * (perc / 100)));
    }

    return valor;
}

function disabledCondicaoPagamento() {
    $('.select2CondPagamento').attr('disabled', true);
}

MobileUI.preencherMask = function(v) {
    $(".valor_unitario_produto").mask("9999,999");
    $('.percentual_desconto').mask('99,99');
}