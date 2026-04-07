-- ⚠️ CLEAN RE-INITIALIZATION (Run this in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Interviews Table
CREATE TABLE interviews (
    id TEXT PRIMARY KEY,
    role_title TEXT, -- Added this!
    jd_text TEXT NOT NULL,
    jd_skills JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active'
);

-- 2. Sessions Table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    interview_id TEXT REFERENCES interviews(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    checklist_state JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 3. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Evaluations Table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    scores JSONB NOT NULL DEFAULT '{}',
    strengths JSONB NOT NULL DEFAULT '[]',
    weaknesses JSONB NOT NULL DEFAULT '[]',
    overall_recommendation TEXT,
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT DEFAULT 'recruiter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
