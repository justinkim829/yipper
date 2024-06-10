/**
 * Name: Jinseok Kim
 * Section: CSE 154 AC
 * Node.js web service for a SNS "Yipper".
 * Provides endpoints for getting all yips,
 * getting yips that match the search term, yips from a user,
 * update likes for a yip, and creating a new yip.
 */

"use strict";

const express = require("express");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const multer = require('multer');

app.use(multer().none());

/**
 * Retrieves all yips or yips that match the search term.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Stringt} req.query.search - The search term for filtering yips
 * @returns {Object} - Returns a JSON object containing yips.
 */
app.get("/yipper/yips", async (req, res) => {
  const qry = req.query.search;
  let result;
  let selection;
  try {
    let db = await getDBConnection();
    if (qry) {
      selection = "Select id From yips WHERE yip LIKE ?";
      result = await db.all(selection, `%${qry}%`);
    } else {
      selection = "Select * From yips ORDER BY DATETIME(date) DESC";
      result = await db.all(selection);
    }
    await db.close();
    let resultJSON = {"yips": result};
    res.status(200).json(resultJSON);
  } catch (err) {
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Retrieves all yips from a specific user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {String} req.params.user - The username to filter yips.
 * @returns {Object} - Returns a JSON object containing yips from the specified user.
 */
app.get("/yipper/user/:user", async (req, res) => {
  let user = req.params.user;
  try {
    let db = await getDBConnection();
    let selection = "Select name, yip, hashtag, date FROM yips " +
                    "WHERE name = ? ORDER BY DATETIME(date) DESC";
    let result = await db.all(selection, user);
    await db.close();
    if (!result.length) {
      res.status(400).send("Yikes. User does not exist.");
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Updates the likes for a specific yip.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} req.body.id - The ID of the yip to update likes.
 * @returns {String} - Returns the updated number of likes for the specified yip.
 */
app.post("/yipper/likes", async (req, res) => {
  const id = req.body.id;
  res.type("text");
  if (id) {
    try {
      let result = await updateLikes(id);
      if (result[0]) {
        res.status(200).send(result[1]);
      } else {
        res.status(400).send("Yikes. ID does not exist.");
      }
    } catch (err) {
      res.status(500).send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(400).send("Missing one or more of the required params.");
  }
});

/**
 * Creates a new yip.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} req.body.name - The name of the user creating the yip.
 * @param {Object} req.body.full - The full text of the yip, including the hashtag.
 * @returns {Object} - Returns the newly created yip as a JSON object.
 */
app.post("/yipper/new", async (req, res) => {
  const name = req.body.name;
  const full = req.body.full;

  if (name && full) {
    try {
      let result = await createYip(name, full);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(400).send("Missing one or more of the required params.");
  }
});

/**
 * Updates the likes for a specific yip.
 * @param {number} id - The ID of the yip to update likes.
 * @returns {Array} - first element is the number of changes made
 *                    second element is the updated number of likes as a string.
 * @throws {Error} - Throws an error if there is an issue with the database operation.
 */
async function updateLikes(id) {
  try {
    let db = await getDBConnection();
    let selection = "UPDATE yips SET likes = likes + 1 WHERE id = ?";
    let result = await db.run(selection, id);
    let numLikes = await db.get("SELECT likes from yips WHERE id = ?", id);
    await db.close();
    return [result.changes, numLikes.likes.toString()];
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Creates a new yip in the database.
 * @param {string} name - The name of the user creating the yip.
 * @param {string} full - The full text of the yip, including the hashtag.
 * @returns {Object} - Returns the newly created yip as a JSON object
 * @throws {Error} - Throws an error if there is an issue with the database operation.
 */
async function createYip(name, full) {
  const hashtagIndex = full.indexOf("#");
  const yip = full.substring(0, hashtagIndex).trim();
  const hashtag = full.substring(hashtagIndex + 1).trim();
  const likes = 0;

  try {
    let db = await getDBConnection();
    let lastIDJSON = await db.get("SELECT id FROM yips ORDER BY id DESC");
    let newID = lastIDJSON.id + 1;
    let insertion = "INSERT INTO yips (id, name, yip, hashtag, likes) " +
                    "VALUES (?, ?, ?, ?, ?)";
    await db.run(insertion, newID, name, yip, hashtag, likes);
    let result = await db.get("SELECT * FROM yips WHERE id = ?", newID);
    await db.close();
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Establishes a connection to the SQLite database.
 * @returns {Object} - Returns the database object.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'yipper.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);