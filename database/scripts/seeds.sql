USE projeto_integrador;

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-QUI-001', 'Kit Reações Químicas e Titulação', 'Conjunto para experimento de ácido-base com reagentes e vidraria.', 'Química', 349.90, 25
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-QUI-001');

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-QUI-002', 'Kit Modelos Moleculares 3D', 'Kit com esferas e hastes para montagem de cadeias de química orgânica.', 'Química', 189.90, 40
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-QUI-002');

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-QUI-003', 'Kit Eletroquímica e Pilhas', 'Montagem de células galvânicas e experimentos de eletrólise.', 'Química', 229.90, 30
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-QUI-003');

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-FIS-001', 'Kit Mecânica e Leis de Newton', 'Trilho de ar adaptado, dinamômetros e massa padronizadas.', 'Física', 399.00, 20
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-FIS-001');

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-FIS-002', 'Kit Eletromagnetismo e Circuitos', 'Bancada com resistores, capacitores e sensores magnéticos.', 'Física', 450.00, 18
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-FIS-002');

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque)
SELECT 'KIT-FIS-003', 'Kit Óptica Geométrica e Lentes', 'Fonte laser de linhas, primas e espelhos para refração e reflexão.', 'Física', 280.00, 35
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE sku = 'KIT-FIS-003');

INSERT INTO cliente (nome_escola, cnpj_cpf, email, telefone)
SELECT 'Colégio Exemplo de Ensino', '12.345.678/0001-90', 'contato@colegioexemplo.com.br', '(11) 98765-4321'
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE email = 'contato@colegioexemplo.com.br');

INSERT INTO cadastro (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep)
SELECT c.id_cliente, 'Av. Paulista', '1000', 'Bloco B - Sala 42', 'Bela Vista', 'São Paulo', 'SP', '01310-100'
FROM cliente c
WHERE c.email = 'contato@colegioexemplo.com.br'
  AND NOT EXISTS (SELECT 1 FROM cadastro WHERE id_cliente = c.id_cliente);

INSERT INTO login (id_cliente, usuario, senha_hash, ativo)
SELECT c.id_cliente, 'admin', '$2b$10$TfbquDhONkJFxW36UYR9V.ZihbCBApkezIzBCsJF3JPIOxy6S7Dle', TRUE
FROM cliente c
WHERE c.email = 'contato@colegioexemplo.com.br'
  AND NOT EXISTS (SELECT 1 FROM login WHERE usuario = 'admin');