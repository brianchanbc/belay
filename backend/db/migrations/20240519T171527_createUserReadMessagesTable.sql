CREATE TABLE userReadMessages (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    last_seen_message_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (channel_id) REFERENCES channels (id),
    FOREIGN KEY (last_seen_message_id) REFERENCES messages (id)
);