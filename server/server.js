const express = require("express");
const bodyParser = require("body-parser");
const couchbase = require("couchbase");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Couchbase Capella configuration
let cluster;
const connectCouchbase = async () => {
  if (!cluster) {
    cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
      configProfile: "wanDevelopment",
    });
  }
  return cluster;
};

const getCollection = async () => {
  const cluster = await connectCouchbase();
  const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
  return bucket.defaultCollection();
};

/**
 * Route to handle player sign-in and record creation
 */
app.post("/api/players", async (req, res) => {
  try {
    const { name, email, consent } = req.body;

    // Construct a unique ID for the player
    const playerId = `player::${email}`;

    // Player JSON document
    const playerDocument = {
      name,
      email,
      consent,
      gameplay: {
        startTime: new Date().toISOString(),
        states: [],
        score: 0,
        lives: 1,
      },
    };

    const collection = await getCollection();

    // Upsert (Insert or Update) player record
    await collection.upsert(playerId, playerDocument);

    res.status(200).json({ message: "Player record created/updated successfully", playerId });
  } catch (error) {
    console.error("Error creating/updating player record:", error);
    res.status(500).json({ error: "Failed to create/update player record" });
  }
});

/**
 * Route to handle gameplay updates
 */
app.put("/api/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    const { gameplayState } = req.body;

    const collection = await getCollection();

    // Fetch the current player document
    const result = await collection.get(playerId);
    const playerDocument = result.content;

    // Update the gameplay state
    playerDocument.gameplay.states.push({
      timestamp: new Date().toISOString(),
      state: gameplayState,
    });

    // Upsert the updated document
    await collection.upsert(playerId, playerDocument);

    res.status(200).json({ message: "Gameplay state updated successfully" });
  } catch (error) {
    console.error("Error updating gameplay state:", error);
    res.status(500).json({ error: "Failed to update gameplay state" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };
