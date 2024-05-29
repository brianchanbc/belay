/* Below are commands to create the SQL files for creating tables in the database.
touch $(date -u +"%Y%m%dT%H%M%S")_createChannelTable.sql
touch $(date -u +"%Y%m%dT%H%M%S")_createMessageTable.sql
touch $(date -u +"%Y%m%dT%H%M%S")_createReactionTable.sql
touch $(date -u +"%Y%m%dT%H%M%S")_createUserTable.sql
touch $(date -u +"%Y%m%dT%H%M%S")_createUserReadMessageTable.sql
*/

// Reference: https://www.sqlitetutorial.net/sqlite-nodejs/connect/
// Reference: https://github.com/TryGhost/node-sqlite3

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

let dbPath = 'belaySQLite.db';
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the database.');
});

db.serialize(() => {
    let migrationsDir = 'migrations/';
    fs.readdirSync(migrationsDir).forEach(file => {
      let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        db.run(sql);
        console.log(`Executed ${file}`);
      } catch (err) {
        console.error(err.message);
      }
    });
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});

