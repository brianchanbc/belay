import express, { Express, Request, Response, NextFunction } from 'express';
import sqlite3, { Database, Statement } from 'sqlite3';
import bcrypt from 'bcrypt';

const app: Express = express();
app.use(express.json())

const saltRounds: number = 10;
const salt: string = bcrypt.genSaltSync(saltRounds);

let dbPath: string = 'db/belaySQLite.db';
const db: Database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error(err.message);
  }
});

function createAPIKey(): string {
  // Generate a random API key of length 40
  let apiKey: string = '';
  const characters: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 40; i++) {
    apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return apiKey;
}

// Helper function to wrap SQLite run method in a Promise
const dbRun = (sql: string, params: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper function to wrap SQLite get method in a Promise
const dbGet = (sql: string, params: any[]): Promise<Statement | null> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: Statement) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to wrap SQLite all method in a Promise
const dbAll = (sql: string, params: any[]): Promise<Statement | null> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, row: Statement) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to wrap bcrypt hash method in a Promise
const bcryptHash = (password: string, salt: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const hash: string = bcrypt.hashSync(password, salt);
      resolve(hash);
    } catch (err) {
      reject(err);
    }
  });
};

// Helper function to wrap bcrypt compare method in a Promise
const bcryptCompare = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const result: boolean = bcrypt.compareSync(password, hash);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

// Middleware function to authenticate API key
const authenticateApiKey = async (request: Request, response: Response, next: NextFunction): Promise<void | Response> => {
  const apiKey = request.headers.apikey;
  // Type guards
  if (typeof apiKey !== 'string') {
    return response.status(400).json({ error: 'API key must be a string' });
  }
  // Input checks
  if (!apiKey) {
    return response.status(400).json({ error: 'API key is required' });
  }

  try {
    const getUserQuery = `SELECT * FROM users WHERE api_key = ?`;
    const row: any | null = await dbGet(getUserQuery, [apiKey]);
    // Check if the API key is valid
    if (!row) {
      return response.status(401).json({ error: 'Invalid API key' });
    }
    // If the API key is valid, pass control to the next middleware function or route handler
    // to continue execution
    next();
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to authenticate' });
  }
};

// User Authentication APIs Endpoints

// API to create user account and returns a session token
app.post('/api/signup', async (request: Request, response: Response): Promise<void | Response> => {
  const username = request.headers.username;
  const password = request.headers.password;

  // Type guards
  if (typeof username !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Username and password must be strings' });
  }

  // Input checks
  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const getUserQuery = `SELECT * FROM users WHERE username = ?`;
    const row: any | null = await dbGet(getUserQuery, [username]);
    // Check if the username is already taken
    if (row) {
      return response.status(400).json({ error: 'Username is already taken' });
    }

    const hashAndSaltedPw: string = await bcryptHash(password, salt);

    const apiKey: string = createAPIKey();
    const insertNewUserQuery = `INSERT INTO users (username, password, api_key) VALUES (?, ?, ?)`;
    await dbRun(insertNewUserQuery, [username, hashAndSaltedPw, apiKey]);

    response.json({ apiKey });
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to sign up' });
  }
});

// API to login and returns a session token
app.get('/api/login', async (request: Request, response: Response): Promise<void | Response> => {
  const username = request.headers.username;
  const password = request.headers.password;

  // Type guards
  if (typeof username !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Username and password must be strings' });
  }

  // Input checks
  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const getUserQuery = `SELECT * FROM users WHERE username = ?`;
    const row: any | null = await dbGet(getUserQuery, [username]);
    // Check if the username exists and the password matches
    if (!row) {
      return response.status(400).json({ error: 'Username does not exist or password does not match' });
    }

    const result: boolean = await bcryptCompare(password, row.password);
    if (result) {
      return response.json({ apiKey: row.api_key });
    } else {
      console.log(`User failed to log in with username: ${username}`);
      return response.status(400).json({ error: 'Username does not exist or password does not match' });
    }
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to login' });
  }
});

// API to change profile
app.put('/api/change_profile', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  const { newusername: newUsername, newpassword: newPassword, apikey: apiKey } = request.headers;
  
  // Type guards
  if (typeof newUsername !== 'string' || typeof newPassword !== 'string' || typeof apiKey !== 'string') {
    return response.status(400).json({ error: 'New username, new password and API key must be strings' });
  }

  // Input checks, no need to check apikey as it is already authenticated in authenticateApiKey middleware
  if (!newUsername && !newPassword) {
    return response.status(400).json({ error: 'New username or password is required' });
  }

  try {
    if (newUsername) {
      const changeUsernameQuery = `UPDATE users SET username = ? WHERE api_key = ?`;
      await dbRun(changeUsernameQuery, [newUsername, apiKey]);
    }

    if (newPassword) {
      const hashAndSaltedPw = await bcryptHash(newPassword, salt);
      const changePasswordQuery = `UPDATE users SET password = ? WHERE api_key = ?`;
      await dbRun(changePasswordQuery, [hashAndSaltedPw, apiKey]);
    }

    return response.json({ message: 'Profile changed successfully' });
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to change profile' });
  }
});


// Functional APIs Endpoints

// API to create channel
app.post('/api/create_channel', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  const { channelName } = request.body;
  
  // Type guards
  if (typeof channelName !== 'string') {
    return response.status(400).json({ error: 'Channel name must be a string' });
  }

  // Input checks
  if (!channelName) {
    return response.status(400).json({ error: 'Channel name is required' });
  }

  try {
    // Duplicate channel name will be caught in error below
    const createChannelQuery = `INSERT INTO channels (name) VALUES (?)`;
    await dbRun(createChannelQuery, [channelName]);
    return response.json({ message: 'Channel created successfully' });
  } catch (err) {
    console.error(err.message);
    return response.status(400).json({ error: 'Failed to create a unique new channel' });
  }
});
  
// API to get channels
app.get('/api/get_channels', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  try {
    const getChannelsQuery = `SELECT * FROM channels`;
    const rows: any | null = await dbAll(getChannelsQuery, []);
    response.json(rows);
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to get channels' });
  }
});

// API to create message
app.post('/api/create_message/:channelName', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  const { channelName } = request.params;
  const { username, messageContent, repliesTo } = request.body;

  // Type guards
  if (typeof channelName !== 'string' || typeof username !== 'string' || typeof messageContent !== 'string') {
    return response.status(400).json({ error: 'Channel name, username and message content must be strings' });
  }

  // Input checks
  if (!username || !messageContent) {
    return response.status(400).json({ error: 'Username and message content are required' });
  }

  try {
    // Get channel id
    const channelRow: any | null = await dbGet(`SELECT id FROM channels WHERE name = ?`, [channelName]);
    // Input check
    if (!channelRow) {
      return response.status(404).json({ error: 'Channel not found' });
    }
    const channelId = channelRow.id;

    // Get user id
    const userRow: any | null = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
    // Input check
    if (!userRow) {
      return response.status(404).json({ error: 'User not found' });
    }
    const userId = userRow.id;

    // Run query to create the message
    const createMessageQuery = `INSERT INTO messages (channel_id, user_id, content, replies_to) VALUES (?, ?, ?, ?)`;
    await dbRun(createMessageQuery, [channelId, userId, messageContent, repliesTo]);

    return response.json({ message: 'Message created successfully' });
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to create message' });
  }
});

// API to get messages in a channel
app.get('/api/get_messages/:channelid', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  // Take out the channel id
  const channelId = request.params.channelid;

  // Type guards
  if (typeof channelId !== 'string') {
    return response.status(400).json({ error: 'Channel id must be a string' });
  }

  // Input checks
  if (!channelId) {
    return response.status(400).json({ error: 'Channel id is required' });
  }

  try {
    // Run query to get the messages that corresponds to this channelID, join user table
    // to add the username to the column and left join reactions table to add the emoji
    const getMessagesQuery = `
      SELECT m.*, u.username as message_username, r.emoji, r.user_id as reaction_user_id, u2.username as reaction_username
      FROM messages m 
      JOIN users u ON m.user_id = u.id
      LEFT JOIN reactions r ON m.id = r.message_id
      LEFT JOIN users u2 ON r.user_id = u2.id
      WHERE m.channel_id = ?
    `;
    const rows: any | null = await dbAll(getMessagesQuery, [channelId]);

    // Create a map and store all lead messages and give them an empty array of replies
    const messagesMap = {};
    rows.forEach(row => {
      if (!messagesMap[row.id]) {
        messagesMap[row.id] = {
          messageId: row.id,
          content: row.content,
          username: row.message_username,
          createdAt: row.created_at,
          parent: row.replies_to,
          replies: [],
          likes: [],
          dislikes: []
        };
      }

      if (row.emoji === 'like') {
        messagesMap[row.id].likes.push(row.reaction_username);
      } else if (row.emoji === 'dislike') {
        messagesMap[row.id].dislikes.push(row.reaction_username);
      }
    });

    // Move child messages to their parent message's replies array
    Object.keys(messagesMap).forEach(key => {
      const message = messagesMap[key];
      if (message.parent) {
        messagesMap[message.parent].replies.push(message);
        delete messagesMap[key];
      }
    });
    
    response.json(Object.entries(messagesMap).map(([id, message]) => ({ id, message })));
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to get messages' });
  }
});

// API to add/update a reaction to a message
app.post('/api/update_reaction/:message_id', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  // Take out the message id, emoji and username
  const { message_id: messageID } = request.params;
  const { emoji, username } = request.body;
  
  // Type guards
  if (typeof messageID !== 'string' || typeof emoji !== 'string' || typeof username !== 'string') {
    return response.status(400).json({ error: 'Message id, emoji and username must be strings' });
  }
  // Input checks
  if (!emoji || !username) {
    return response.status(400).json({ error: 'Emoji and username are required' });
  }
  if (emoji !== 'like' && emoji !== 'dislike') {
    return response.status(400).json({ error: 'Invalid emoji' });
  }
  const message = await dbGet(`SELECT id FROM messages WHERE id = ?`, [messageID]);
  if (!message) {
    return response.status(404).json({ error: 'Message not found' });
  }

  try {
    // Get user id
    const userRow: any | null = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
    const userId = userRow.id;

    // Check if a reaction already exists
    const existingReaction: any | null = await dbGet(`SELECT emoji FROM reactions WHERE message_id = ? AND user_id = ?`, [messageID, userId]);

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // If the existing reaction is the same as the new one, delete it
        await dbRun(`DELETE FROM reactions WHERE message_id = ? AND user_id = ?`, [messageID, userId]);
        response.json({ message: 'Reaction deleted successfully' });
      } else {
        // If the existing reaction is different from the new one, update it
        await dbRun(`UPDATE reactions SET emoji = ? WHERE message_id = ? AND user_id = ?`, [emoji, messageID, userId]);
        response.json({ message: 'Reaction updated successfully' });
      }
    } else {
      // If no reaction exists, insert a new one
      await dbRun(`INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)`, [messageID, userId, emoji]);
      response.json({ message: 'Reaction added successfully' });
    }
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to add, update or delete reaction' });
  }
});

// API to update a user's last seen message in a channel
app.put('/api/update_last_seen_message/:channelid', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  try {
    const { channelid } = request.params;
    const { username } = request.body;
    // Type guards
    if (typeof channelid !== 'string' || typeof username !== 'string') {
      return response.status(400).json({ error: 'Channel id and username must be strings' });
    }
    // Input checks
    if (!username) {
      return response.status(400).json({ error: 'Username is required' });
    }
    if (!channelid) {
      return response.status(400).json({ error: 'Channel id is required' });
    }

    // Get user id
    const userRow: any | null = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
    if (!userRow) {
      return response.status(404).json({ error: 'User not found' });
    }
    const userId = userRow.id;

    // Get the last message id from the channel
    const messageRow: any | null = await dbGet(`SELECT id FROM messages WHERE channel_id = ? ORDER BY id DESC LIMIT 1`, [channelid]);
    if (!messageRow) {
      return response.json({ message: 'No message in the channel' });
    }
    const lastSeenMessageId = messageRow.id;

    // Check if a row already exists for this user and channel
    const userReadMessageRow = await dbGet(`
      SELECT * FROM userReadMessages WHERE user_id = ? AND channel_id = ?
    `, [userId, channelid]);

    if (userReadMessageRow) {
      // If a row exists, update it
      await dbRun(`
        UPDATE userReadMessages
        SET last_seen_message_id = ?
        WHERE user_id = ? AND channel_id = ?
      `, [lastSeenMessageId, userId, channelid]);
    } else {
      // If no row exists, insert a new one
      await dbRun(`
        INSERT INTO userReadMessages (user_id, channel_id, last_seen_message_id)
        VALUES (?, ?, ?)
      `, [userId, channelid, lastSeenMessageId]);
    }

    response.json({ message: 'Last seen message updated successfully' });
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to update last seen message' });
  }
});

// API to return unread message counts for a user for each channel in one query
app.get('/api/get_unread_message_counts/:username', authenticateApiKey, async (request: Request, response: Response): Promise<Response> => {
  try {
    // Take out the username
    const username = request.params.username;
    // Type guards
    if (typeof username !== 'string') {
      return response.status(400).json({ error: 'Username must be a string' });
    }
    // Input checks
    if (!username) {
      return response.status(400).json({ error: 'Username is required' });
    }
    const userRow: any | null = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
    // Check if the username exists
    if (!userRow) {
      return response.status(404).json({ error: 'User not found' });
    }
    const userId = userRow.id;

    // Run query to get the unread message counts for each channel
    const getUnreadMessageCountsQuery = `
      SELECT c.name, c.id as channel_id, COUNT(m.id) as unread_message_count
      FROM channels c
      JOIN messages m ON c.id = m.channel_id
      LEFT JOIN userReadMessages urm ON c.id = urm.channel_id AND urm.user_id = ?
      WHERE m.id > IFNULL(urm.last_seen_message_id, 0)
      GROUP BY c.id
    `;
    const rows = await dbAll(getUnreadMessageCountsQuery, [userId]);

    response.json(rows);
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({ error: 'Failed to get unread message counts' });
  }
});

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
    process.exit(0);
  });
});