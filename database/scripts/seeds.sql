USE projeto_integrador;

INSERT INTO cliente (nome_escola, cnpj_cpf, email, telefone) 
VALUES ('Escola Teste EduScience', '12.345.678/0001-99', 'admin@escola.com.br', '(11) 99999-9999');

INSERT INTO cadastro (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep)
VALUES (1, 'Av. Paulista', '1000', 'Bloco B', 'Bela Vista', 'São Paulo', 'SP', '01310-100');

INSERT INTO login (id_cliente, usuario, senha_hash, ativo) 
VALUES (1, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

INSERT INTO produto (sku, nome_kit, descricao, categoria, preco, estoque, ativo) VALUES 
('KIT-ROB-001', 'Kit Robótica Educacional Arduino', 'Kit completo com placa Uno, sensores e jumpers.', 'Robótica', 249.90, 15, TRUE),
('KIT-BIO-002', 'Microscópio Óptico Escolar 1000x', 'Microscópio binocular para laboratórios de biologia.', 'Biologia', 890.00, 8, TRUE),
('KIT-QUI-003', 'Kit Vidraria Química Básica', 'Béqueres, provetas e erlenmeyers em borossilicato.', 'Química', 175.50, 25, TRUE);