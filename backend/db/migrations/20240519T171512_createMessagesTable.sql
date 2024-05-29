CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replies_to INTEGER,
    FOREIGN KEY (channel_id) REFERENCES channels (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (replies_to) REFERENCES messages (id)
);