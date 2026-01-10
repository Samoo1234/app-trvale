-- =============================================================================
-- TRVALE DO BOI - Sistema de Transporte de Gado
-- Script de criação do banco de dados Supabase
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA: motoristas
-- Armazena os dados dos motoristas da transportadora
-- =============================================================================
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL, -- Formato: 000.000.000-00
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por CPF (usado no login)
CREATE INDEX IF NOT EXISTS idx_motoristas_cpf ON motoristas(cpf);

-- Comentários descritivos
COMMENT ON TABLE motoristas IS 'Cadastro de motoristas da transportadora';
COMMENT ON COLUMN motoristas.cpf IS 'CPF do motorista no formato 000.000.000-00';
COMMENT ON COLUMN motoristas.ativo IS 'Indica se o motorista está ativo no sistema';

-- =============================================================================
-- TABELA: viagens
-- Registra todas as viagens realizadas
-- =============================================================================
CREATE TABLE IF NOT EXISTS viagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motorista_id UUID NOT NULL REFERENCES motoristas(id) ON DELETE RESTRICT,
    veiculo VARCHAR(20) NOT NULL, -- Placa do veículo
    origem VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    qtd_gado INTEGER NOT NULL DEFAULT 0, -- Quantidade de cabeças de gado
    km_total DECIMAL(10, 2) DEFAULT 0, -- KM total da viagem
    inicio_em TIMESTAMP WITH TIME ZONE NOT NULL,
    fim_em TIMESTAMP WITH TIME ZONE,
    sync BOOLEAN DEFAULT true, -- Já sincronizado com o servidor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_viagens_motorista ON viagens(motorista_id);
CREATE INDEX IF NOT EXISTS idx_viagens_data ON viagens(inicio_em);
CREATE INDEX IF NOT EXISTS idx_viagens_veiculo ON viagens(veiculo);
CREATE INDEX IF NOT EXISTS idx_viagens_sync ON viagens(sync) WHERE sync = false;

-- Comentários descritivos
COMMENT ON TABLE viagens IS 'Registro de viagens de transporte de gado';
COMMENT ON COLUMN viagens.veiculo IS 'Placa do veículo utilizado na viagem';
COMMENT ON COLUMN viagens.qtd_gado IS 'Quantidade de cabeças de gado transportadas';
COMMENT ON COLUMN viagens.km_total IS 'Quilometragem total percorrida na viagem';
COMMENT ON COLUMN viagens.sync IS 'Indica se o registro foi sincronizado do app mobile';

-- =============================================================================
-- TABELA: pontos_gps
-- Armazena os pontos GPS coletados durante a viagem (opcional)
-- =============================================================================
CREATE TABLE IF NOT EXISTS pontos_gps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por viagem
CREATE INDEX IF NOT EXISTS idx_pontos_gps_viagem ON pontos_gps(viagem_id);

-- Comentários descritivos
COMMENT ON TABLE pontos_gps IS 'Pontos GPS coletados durante as viagens';
COMMENT ON COLUMN pontos_gps.latitude IS 'Latitude do ponto GPS';
COMMENT ON COLUMN pontos_gps.longitude IS 'Longitude do ponto GPS';

-- =============================================================================
-- TABELA: usuarios_admin
-- Usuários do painel administrativo (gerência)
-- =============================================================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários descritivos
COMMENT ON TABLE usuarios_admin IS 'Usuários do painel administrativo web';

-- =============================================================================
-- FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática do updated_at
CREATE TRIGGER update_motoristas_updated_at
    BEFORE UPDATE ON motoristas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viagens_updated_at
    BEFORE UPDATE ON viagens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_admin_updated_at
    BEFORE UPDATE ON usuarios_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_gps ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas para motoristas (acesso autenticado)
CREATE POLICY "Motoristas podem ver seus próprios dados"
    ON motoristas FOR SELECT
    USING (auth.uid()::text = id::text OR EXISTS (
        SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Admins podem gerenciar motoristas"
    ON motoristas FOR ALL
    USING (EXISTS (
        SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
    ));

-- Políticas para viagens
CREATE POLICY "Motoristas podem ver suas próprias viagens"
    ON viagens FOR SELECT
    USING (motorista_id::text = auth.uid()::text OR EXISTS (
        SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Motoristas podem inserir suas viagens"
    ON viagens FOR INSERT
    WITH CHECK (motorista_id::text = auth.uid()::text);

CREATE POLICY "Motoristas podem atualizar suas viagens"
    ON viagens FOR UPDATE
    USING (motorista_id::text = auth.uid()::text);

CREATE POLICY "Admins podem gerenciar todas as viagens"
    ON viagens FOR ALL
    USING (EXISTS (
        SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
    ));

-- Políticas para pontos_gps
CREATE POLICY "Acesso aos pontos GPS"
    ON pontos_gps FOR ALL
    USING (EXISTS (
        SELECT 1 FROM viagens v 
        WHERE v.id = viagem_id 
        AND (v.motorista_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM usuarios_admin WHERE id::text = auth.uid()::text
        ))
    ));

-- Políticas para usuarios_admin
CREATE POLICY "Admins podem ver outros admins"
    ON usuarios_admin FOR SELECT
    USING (true);

-- =============================================================================
-- VIEWS PARA O PAINEL ADMINISTRATIVO
-- =============================================================================

-- View com resumo das viagens
CREATE OR REPLACE VIEW v_resumo_viagens AS
SELECT 
    v.id,
    v.inicio_em,
    v.fim_em,
    v.veiculo,
    v.origem,
    v.destino,
    v.qtd_gado,
    v.km_total,
    m.nome AS motorista_nome,
    m.cpf AS motorista_cpf,
    EXTRACT(EPOCH FROM (v.fim_em - v.inicio_em)) / 3600 AS duracao_horas
FROM viagens v
INNER JOIN motoristas m ON v.motorista_id = m.id
ORDER BY v.inicio_em DESC;

-- View com estatísticas mensais
CREATE OR REPLACE VIEW v_estatisticas_mensais AS
SELECT 
    DATE_TRUNC('month', inicio_em) AS mes,
    COUNT(*) AS total_viagens,
    SUM(km_total) AS km_total,
    SUM(qtd_gado) AS total_gado,
    COUNT(DISTINCT veiculo) AS veiculos_ativos,
    COUNT(DISTINCT motorista_id) AS motoristas_ativos
FROM viagens
WHERE fim_em IS NOT NULL
GROUP BY DATE_TRUNC('month', inicio_em)
ORDER BY mes DESC;

-- =============================================================================
-- DADOS INICIAIS DE TESTE
-- =============================================================================

-- Inserir motorista de teste (senha: 123456)
-- NOTA: Em produção, usar Supabase Auth para gerenciar autenticação
INSERT INTO motoristas (nome, cpf) VALUES
    ('João da Silva', '123.456.789-00'),
    ('Maria Oliveira', '987.654.321-00'),
    ('Pedro Santos', '456.789.123-00')
ON CONFLICT (cpf) DO NOTHING;

-- =============================================================================
-- INSTRUÇÕES DE CONFIGURAÇÃO
-- =============================================================================
-- 
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Configure as variáveis de ambiente no app mobile e painel web:
--    - SUPABASE_URL: URL do seu projeto Supabase
--    - SUPABASE_ANON_KEY: Chave anon pública
--    - SUPABASE_SERVICE_KEY: Chave de serviço (apenas backend)
-- 
-- 3. Para autenticação de motoristas com CPF+senha, configure:
--    - Supabase Auth > Providers > Email (desabilitar confirmação de email)
--    - Ou use autenticação customizada via Edge Functions
-- 
-- =============================================================================
