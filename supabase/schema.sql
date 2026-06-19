-- Create VisitStatus enum
DO $$ BEGIN
    CREATE TYPE "VisitStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Patient table
CREATE TABLE IF NOT EXISTS "Patient" (
  id SERIAL PRIMARY KEY,
  "fullName" VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Visit table
CREATE TABLE IF NOT EXISTS "Visit" (
  id SERIAL PRIMARY KEY,
  "patientId" INT REFERENCES "Patient"(id) ON DELETE CASCADE NOT NULL,
  "queueNumber" INT NOT NULL,
  symptoms TEXT NOT NULL,
  status "VisitStatus" DEFAULT 'WAITING'::"VisitStatus" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
