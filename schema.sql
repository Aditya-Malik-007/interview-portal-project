DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    branch        VARCHAR(50)  NOT NULL,
    name          TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company    VARCHAR(100) NOT NULL,
    role       VARCHAR(100) NOT NULL,
    status     VARCHAR(50)  NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify schema
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('users', 'posts')
ORDER BY table_name, ordinal_position;
