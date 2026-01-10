-- =============================================================================
-- TRVALE DO BOI - Correção das Políticas RLS para Login
-- Execute este script no SQL Editor do Supabase
-- =============================================================================

-- Primeiro, vamos remover as políticas problemáticas da tabela motoristas
DROP POLICY IF EXISTS "Motoristas podem ver seus próprios dados" ON motoristas;
DROP POLICY IF EXISTS "Admins podem gerenciar motoristas" ON motoristas;

-- Criar uma política que permite leitura pública da tabela motoristas
-- Isso é necessário para o processo de login (buscar motorista pelo CPF)
CREATE POLICY "Permitir leitura publica para login"
    ON motoristas FOR SELECT
    USING (true);

-- Política para permitir que admins gerenciem motoristas
CREATE POLICY "Admins podem gerenciar motoristas"
    ON motoristas 
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
        )
    );

-- =============================================================================
-- Verificar se o motorista está cadastrado corretamente
-- =============================================================================

-- Listar todos os motoristas para conferir
SELECT id, nome, cpf, ativo, created_at FROM motoristas;

-- Se não houver motoristas, inserir os de teste:
INSERT INTO motoristas (nome, cpf, ativo) VALUES 
    ('João da Silva', '123.456.789-00', true),
    ('Maria Oliveira', '987.654.321-00', true),
    ('Pedro Santos', '456.789.123-00', true)
ON CONFLICT (cpf) DO UPDATE SET ativo = true;
