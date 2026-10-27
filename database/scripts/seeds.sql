USE projeto_integrador;

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque) VALUES
('KIT-QUI-001', 'Kit Reações Químicas e Titulação', 'Conjunto para experimento de ácido-base com reagentes e vidraria.', 'Química', 349.90, 25),
('KIT-QUI-002', 'Kit Modelos Moleculares 3D', 'Kit com esferas e hastes para montagem de cadeias de química orgânica.', 'Química', 189.90, 40),
('KIT-QUI-003', 'Kit Eletroquímica e Pilhas', 'Montagem de células galvânicas e experimentos de eletrólise.', 'Química', 229.90, 30),
('KIT-FIS-001', 'Kit Mecânica e Leis de Newton', 'Trilho de ar adaptado, dinamômetros e massa padronizadas.', 'Física', 399.00, 20),
('KIT-FIS-002', 'Kit Eletromagnetismo e Circuitos', 'Bancada com resistores, capacitores e sensores magnéticos.', 'Física', 450.00, 18),
('KIT-FIS-003', 'Kit Óptica Geométrica e Lentes', 'Fonte laser de linhas, primas e espelhos para refração e reflexão.', 'Física', 280.00, 35);

INSERT INTO cliente (nome_escola, cnpj_cpf, email, telefone) VALUES
('Colégio Exemplo de Ensino', '12.345.678/0001-90', 'contato@colegioexemplo.com.br', '(11) 98765-4321');