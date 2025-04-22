-- Crearea tabelei pentru evenimentele din calendar
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  participants TEXT[],
  color TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adăugarea comentariilor pentru tabelă și coloane
COMMENT ON TABLE calendar_events IS 'Tabela pentru stocarea evenimentelor din calendar';
COMMENT ON COLUMN calendar_events.id IS 'ID-ul unic al evenimentului';
COMMENT ON COLUMN calendar_events.title IS 'Titlul evenimentului';
COMMENT ON COLUMN calendar_events.description IS 'Descrierea evenimentului';
COMMENT ON COLUMN calendar_events.date IS 'Data evenimentului';
COMMENT ON COLUMN calendar_events.start_time IS 'Ora de început a evenimentului';
COMMENT ON COLUMN calendar_events.end_time IS 'Ora de sfârșit a evenimentului';
COMMENT ON COLUMN calendar_events.location IS 'Locația evenimentului';
COMMENT ON COLUMN calendar_events.participants IS 'Lista de participanți la eveniment';
COMMENT ON COLUMN calendar_events.color IS 'Culoarea evenimentului în calendar';
COMMENT ON COLUMN calendar_events.created_by IS 'Utilizatorul care a creat evenimentul';
COMMENT ON COLUMN calendar_events.created_at IS 'Data și ora creării evenimentului';
COMMENT ON COLUMN calendar_events.updated_at IS 'Data și ora ultimei actualizări a evenimentului';

-- Crearea indexurilor pentru performanță
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events(date);
CREATE INDEX IF NOT EXISTS calendar_events_created_by_idx ON calendar_events(created_by);

-- Adăugarea politicilor RLS pentru securitate
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Politica pentru vizualizarea evenimentelor
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (true);  -- Toți utilizatorii autentificați pot vedea toate evenimentele

-- Politica pentru inserarea evenimentelor
CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);  -- Utilizatorii pot insera doar evenimente create de ei

-- Politica pentru actualizarea evenimentelor
CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    auth.uid() = created_by OR  -- Utilizatorii pot actualiza doar evenimentele create de ei
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')  -- Administratorii și managerii pot actualiza orice eveniment
    )
  );

-- Politica pentru ștergerea evenimentelor
CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    auth.uid() = created_by OR  -- Utilizatorii pot șterge doar evenimentele create de ei
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')  -- Administratorii și managerii pot șterge orice eveniment
    )
  );

-- Funcție pentru actualizarea automată a câmpului updated_at
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru actualizarea automată a câmpului updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_calendar_events_updated_at();
