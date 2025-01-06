-- Create the files table for metadata
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  parsed_status BOOLEAN DEFAULT false
);

-- Create the file_contents table for parsed markdown
CREATE TABLE file_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups
CREATE INDEX idx_file_contents_file_id ON file_contents(file_id);

-- Create embeddings table for pgvector
CREATE TABLE embeddings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  file_id UUID NOT NULL REFERENCES files(id),
  content_chunk TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- Add cascade delete
ALTER TABLE embeddings
DROP CONSTRAINT embeddings_file_id_fkey,
ADD CONSTRAINT embeddings_file_id_fkey
  FOREIGN KEY (file_id)
  REFERENCES files(id)
  ON DELETE CASCADE;

-- Create HNSW index for cosine similarity (for OpenAI embeddings)
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Create function to get database connection URL
CREATE OR REPLACE FUNCTION get_db_url()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator's permissions
AS $$
BEGIN
  -- Format: postgresql://user:password@host:port/database
  RETURN format(
    'postgresql://%s:%s@%s:%s/%s',
    current_user,
    current_setting('postgres.password'),
    current_setting('db.host'),
    current_setting('db.port'),
    current_setting('db.name')
  );
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION get_db_url() TO anon;