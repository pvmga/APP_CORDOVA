var db;
document.addEventListener('deviceready', onDeviceready);

function onDeviceready() {

    db = sqlitePlugin.openDatabase({name: 'mydb.db'});

    db.transaction(function (txn) {
        var sql = 'create table if not exists parametros(';
        sql += ' ref_codigo integer primary key,';
        sql += ' online_perm_dig_desconto varchar(1),';
        sql += ' calc_impostos_nf text,';
        sql += ' estado varchar(2),';
        sql += ' casas_decimais_venda varchar(1),';
        sql += ' online_perm_alt_precos varchar(1)';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists venda(';
        sql += ' cod_venda integer primary key autoincrement,';
        sql += ' ref_venda integer,';
        sql += ' cod_clie integer,';
        sql += ' cod_pagamento integer,';
        sql += ' tipo_pagamento varchar(10),';
        sql += ' total_venda text,';
        sql += ' sincronizado varchar(1)';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists itensven(';
        //sql += ' cod_venda integer,';
        sql += ' cod_clie integer,';
        sql += ' cod_produto integer,';
        sql += ' descricao_produto varchar(60),';
        sql += ' valor_unitario text,';
        sql += ' valor_unitario_original text,';
        sql += ' percentual_desconto text,';
        sql += ' percentual_acrescimo text,';
        sql += ' aliquota_ipi text,';
        sql += ' quantidade integer,';
        sql += ' cod_grupo integer,';
        sql += ' unidade varchar(2),';
        sql += ' valor_total text,';
        sql += ' custo_bruto text,';
        sql += ' st_ipi text,';
        sql += ' valor_unit_liq text';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists cad_nbmi(';
        sql += ' ref_codigo integer primary key,';
        sql += ' nbm varchar(12),';
        sql += ' ncm varchar(12),';
        sql += ' perc_red_st text,';
        sql += ' icms text,';
        sql += ' st_ac text,';
        sql += ' st_al text,';
        sql += ' st_am text,';
        sql += ' st_ap text,';
        sql += ' st_ba text,';
        sql += ' st_ce text,';
        sql += ' st_df text,';
        sql += ' st_es text,';
        sql += ' st_ex text,';
        sql += ' st_ma text,';
        sql += ' st_mg text,';
        sql += ' st_ms text,';
        sql += ' st_mt text,';
        sql += ' st_pa text,';
        sql += ' st_pb text,';
        sql += ' st_pe text,';
        sql += ' st_pi text,';
        sql += ' st_pr text,';
        sql += ' st_rj text,';
        sql += ' st_rn text,';
        sql += ' st_ro text,';
        sql += ' st_rr text,';
        sql += ' st_rs text,';
        sql += ' st_sc text,';
        sql += ' st_se text,';
        sql += ' st_sp text,';
        sql += ' st_toc text,';
        sql += ' st_goi text,';
        sql += ' st_sn_ac text,';
        sql += ' st_sn_al text,';
        sql += ' st_sn_am text,';
        sql += ' st_sn_ap text,';
        sql += ' st_sn_ba text,';
        sql += ' st_sn_ce text,';
        sql += ' st_sn_df text,';
        sql += ' st_sn_es text,';
        sql += ' st_sn_ex text,';
        sql += ' st_sn_ma text,';
        sql += ' st_sn_mg text,';
        sql += ' st_sn_ms text,';
        sql += ' st_sn_mt text,';
        sql += ' st_sn_pa text,';
        sql += ' st_sn_pb text,';
        sql += ' st_sn_pe text,';
        sql += ' st_sn_pi text,';
        sql += ' st_sn_pr text,';
        sql += ' st_sn_rj text,';
        sql += ' st_sn_rn text,';
        sql += ' st_sn_ro text,';
        sql += ' st_sn_rr text,';
        sql += ' st_sn_rs text,';
        sql += ' st_sn_sc text,';
        sql += ' st_sn_se text,';
        sql += ' st_sn_sp text,';
        sql += ' st_sn_toc text,';
        sql += ' st_sn_goi text';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists estados(';
        sql += ' sigla_estado varchar(2),';
        sql += ' desc_estado varchar(50),';
        sql += ' optante_st varchar(1),';
        sql += ' aliquota_externa_icms text,';
        sql += ' aliquota_interna_icms text,';
        sql += ' imp_aliquota_interna_icms text,';
        sql += ' imp_aliquota_externa_icms text';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists tipo(';
        sql += ' ref_codigo integer primary key,';
        sql += ' descricao varchar(50),';
        sql += ' prefixo varchar(20),';
        sql += ' sigla varchar(20)';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists condicao(';
        sql += ' ref_codigo integer primary key,';
        sql += ' descricao varchar(50),';
        sql += ' acrescimo text';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists usuarios(';
        sql += ' ref_codigo integer primary key,';
        sql += ' usuario text,';
        sql += ' cod_vendedor_externo integer,';
        sql += ' senha text';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists produtos(';
        sql += ' ref_codigo integer primary key,';
        sql += ' descricao text,';
        sql += ' grupo integer,';
        sql += ' ref_unidade integer,';
        sql += ' ref_unidade_descricao varchar(2),';
        sql += ' st varchar(3),';
        sql += ' estoqueatual text,';
        sql += ' preco_venda_a text,';
        sql += ' preco_venda_a_original text,';
        sql += ' custo_bruto text,';
        sql += ' percentual_desconto text,';
        sql += ' percentual_desconto_original text,';
        sql += ' nbmipi text,';
        sql += ' aliquota_ipi text,';
        sql += ' aliquota_ipi_original text,';
        sql += ' promocional varchar(2)';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists clientes(';
        sql += ' codigo integer primary key,';
        sql += ' ref_codigo integer,';
        sql += ' natureza varchar(1),';
        sql += ' cgc varchar(18),';
        sql += ' inscricao varchar(18),';
        sql += ' cpf varchar(18),';
        sql += ' rg varchar(16),';
        sql += ' razao_social varchar(50),';
        sql += ' nome_fantasia varchar(50),';
        sql += ' cep varchar(9),';
        sql += ' endereco varchar(40),';
        sql += ' num_end_principal varchar(10),';
        sql += ' comp_endereco varchar(20),';
        sql += ' bairro varchar(40),';
        sql += ' cidade varchar(40),';
        sql += ' estado varchar(2),';
        sql += ' telefone varchar(15),';
        sql += ' celular varchar(15),';
        sql += ' contato varchar(40),';
        sql += ' transportadora integer,';
        sql += ' email varchar(500),';
        sql += ' obs_cadastro text,';
        sql += ' consumidor_final varchar(1),';
        sql += ' calcula_st varchar(1),';
        sql += ' codigo_vendedor integer,';
        sql += ' cod_vendedor_externo integer,';
        sql += ' contribuinte_icms varchar(1),';
        sql += ' sincronizado varchar(1) default "S",';
        sql += ' optante_simples varchar(1)';
        sql += ')';
        txn.executeSql(sql);
    });

    db.transaction(function (txn) {
        var sql = 'create table if not exists atualizacao(';
        sql += ' data_atualizacao text';
        sql += ')';
        txn.executeSql(sql);
    });
}