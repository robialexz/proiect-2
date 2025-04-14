-- Create a simple health check table for connection testing
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ok',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a single row that we can query for health checks
INSERT INTO health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Create a function to update the last_checked timestamp
CREATE OR REPLACE FUNCTION update_health_check_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_checked = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the timestamp on each query
CREATE TRIGGER update_health_check_timestamp
BEFORE UPDATE ON health_check
FOR EACH ROW
EXECUTE FUNCTION update_health_check_timestamp();

-- Create a policy to allow anonymous access for health checks
CREATE POLICY "Allow anonymous health checks" ON health_check
  FOR SELECT
  TO anon
  USING (true);

-- Enable RLS on the health_check table
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;
