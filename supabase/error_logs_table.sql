-- Crearea tabelei error_logs pentru stocarea erorilor
CREATE TABLE IF NOT EXISTS error_logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  severity TEXT NOT NULL,
  stack TEXT,
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adăugarea indexurilor pentru performanță
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON error_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs (severity);
CREATE INDEX IF NOT EXISTS error_logs_source_idx ON error_logs (source);

-- Adăugarea politicilor RLS pentru securitate
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Politica pentru administratori - pot vedea toate erorile
CREATE POLICY admin_error_logs_policy ON error_logs
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );

-- Politica pentru utilizatori - pot vedea doar erorile proprii
CREATE POLICY user_error_logs_policy ON error_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Comentariu explicativ
COMMENT ON TABLE error_logs IS 'Stochează erorile capturate de sistemul de monitorizare a erorilor';
