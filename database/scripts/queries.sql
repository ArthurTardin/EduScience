USE projeto_integrador;

SELECT
    c.nome_escola,
    c.cnpj_cpf,
    co.id_compra,
    co.data_compra,
    nf.numero_nf,
    nf.chave_acesso,
    p.nome_kit AS produto,
    v.quantidade,
    v.preco_unitario,
    v.subtotal,
    co.valor_frete,
    co.valor_total AS total_pedido
FROM cliente c
INNER JOIN compra co ON c.id_cliente = co.id_cliente
INNER JOIN nota_fiscal ON co.id_compra = nf.id_compra
INNER JOIN venda v ON co.id_compra = v.id_compra
INNER join produto p ON v.id_produto = p.id_produto;

SELECT
    c.nome_escola,
    p.nome_kit,
    p.categoria,
    car.quantidade,
    p.preco AS preco_unitario,
    (car.quantidade * p.preco) AS subtotal_estimado,
    car.data_atualizacao
FROM carrinho_de_compra car
INNER JOIN cliente c ON car.id_cliente = c.id_cliente
INNER JOIN produto p ON car.id_produto = p.id_produto;