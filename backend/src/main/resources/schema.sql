-- Database initialization script for Sporttyx
-- This file contains all table definitions based on BACKEND_REQUIREMENTS.md

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    motto VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create team_participants table
CREATE TABLE IF NOT EXISTS team_participants (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    
    UNIQUE(team_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_team_participants_team ON team_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_team_participants_participant ON team_participants(participant_id);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    energy INTEGER NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_team ON activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_participant ON activities(participant_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    invited_by_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invitations_participant ON team_invitations(participant_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_team ON team_invitations(team_id, status);
