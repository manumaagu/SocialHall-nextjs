-- Drop the table if it already exists (optional)
DROP TABLE IF EXISTS linkedin_media;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS media_twitter;
DROP TABLE IF EXISTS media_youtube;
DROP TABLE IF EXISTS pending_linkedin;
DROP TABLE IF EXISTS pending_tweets;
DROP TABLE IF EXISTS pending_youtube;
DROP TABLE IF EXISTS user;

-- Create the table for Linkedin Media
CREATE TABLE media_linkedin (
    id TEXT PRIMARY KEY,
    clerkId TEXT NOT NULL,
    date INTEGER NOT NULL,
    tokenAccess TEXT,
    tokenExpiration INTEGER,
    profile_id TEXT,
    profile_username TEXT,
    profile_picture TEXT,
    profile_followers TEXT
);

-- Create the table for Events
CREATE TABLE event (
    id TEXT PRIMARY KEY,
    clerkId TEXT NOT NULL,
    socialMedia TEXT,
    content TEXT,
    pendingId TEXT,
    date INTEGER,
    posted BOOLEAN NOT NULL
);

-- Create the table for Twitter Media
CREATE TABLE media_twitter (
    id TEXT PRIMARY KEY,
    clerkId TEXT NOT NULL,
    date INTEGER NOT NULL,
    tokenAccess TEXT,
    tokenRefresh TEXT,
    tokenExpiration INTEGER,
    profile_id TEXT,
    profile_username TEXT,
    profile_url TEXT,
    profile_picture TEXT,
    profile_followers TEXT,
    posts TEXT
);

-- Create the table for Youtube Media
CREATE TABLE media_youtube (
    id TEXT PRIMARY KEY,
    clerkId TEXT NOT NULL,
    date INTEGER NOT NULL,
    tokenAccess TEXT,
    tokenRefresh TEXT,
    tokenExpiration INTEGER,
    profile_id TEXT,
    profile_username TEXT,
    profile_url TEXT,
    profile_picture TEXT,
    subscribers TEXT,
    posts TEXT
);

-- Create the table for Pending Linkedin
CREATE TABLE pending_linkedin (
    id TEXT PRIMARY KEY,
    clerkId TEXT NOT NULL,
    twitterId TEXT,
    postingDate INTEGER,
    contentType TEXT,
    content TEXT
);

-- Create the table for Pending Tweets
CREATE TABLE pending_tweets (
    id TEXT PRIMARY KEY,
    twitterId TEXT,
    clerkId TEXT,
    postingDate INTEGER,
    content TEXT
);

-- Create the table for Pending Youtube
CREATE TABLE pending_youtube (
    id TEXT PRIMARY KEY,
    twitterId TEXT,
    clerkId TEXT,
    postingDate INTEGER,
    content TEXT
);

-- Create the table for Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    clerkId TEXT,
    date INTEGER
);
