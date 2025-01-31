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
 * Route to fetch all player data
 */
app.get("/api/players/all", async (req, res) => {
  try {
    const cluster = await connectCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope("_default");
    const query = `SELECT META().id AS id, * FROM \`${process.env.COUCHBASE_BUCKET}\``;

    const result = await cluster.query(query);

    const players = result.rows.map(row => ({
      id: row.id,
      ...row[process.env.COUCHBASE_BUCKET],
    }));

    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching all player data:", error);
    res.status(500).json({ error: "Failed to fetch all player data" });
  }
});

/**
 * Route to handle player sign-in and record creation
 */
app.post("/api/players", async (req, res) => {
  try {
    const { name, company, job_title, email, phone, consent } = req.body;

    // Construct a unique ID for the player
    const playerId = `player::${email}`;

    // Player JSON document
    const playerDocument = {
      name,
      company,
      job_title,
      email,
      phone,
      consent,
      gameplay: {
        startTime: new Date().toISOString(),
        states: [],
        score: 0,
        lives: 1,
      },
      cumulativeStats: {
        coinsCollected: 0,
        fireballsShot: 0,
        enemiesDefeated: 0,
        flagPoleHeight: 0,
      },
      lastStatsSnapshot: {
        coinsCollected: 0,
        fireballsShot: 0,
        enemiesDefeated: 0,
        flagPoleHeight: 0,
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

    // Ensure `cumulativeStats` is initialized
    if (!playerDocument.cumulativeStats) {
      playerDocument.cumulativeStats = {
        coinsCollected: 0,
        fireballsShot: 0,
        enemiesDefeated: 0,
        flagPoleHeight: 0,
      };
    }

    if (!playerDocument.lastStatsSnapshot) {
      playerDocument.lastStatsSnapshot = {
        coinsCollected: 0,
        fireballsShot: 0,
        enemiesDefeated: 0,
        flagPoleHeight: 0,
      };
    }

    // Extract current stats
    const currentStats = gameplayState.state.playerStats || {};

    // Calculate deltas
    const delta = {
      coinsCollected: (currentStats.coinsCollected || 0) - (playerDocument.lastStatsSnapshot.coinsCollected || 0),
      fireballsShot: (currentStats.fireballsShot || 0) - (playerDocument.lastStatsSnapshot.fireballsShot || 0),
      enemiesDefeated: (currentStats.enemiesDefeated || 0) - (playerDocument.lastStatsSnapshot.enemiesDefeated || 0),
      flagPoleHeight: Math.max(
        playerDocument.cumulativeStats.flagPoleHeight,
        currentStats.flagPoleHeight || 0
      ), // Flag height should always store the highest
    };

    // Ensure negative values do not occur (reset to 0 if negative)
    Object.keys(delta).forEach((key) => {
      if (delta[key] < 0) delta[key] = 0;
    });

    // Apply deltas to cumulative stats
    playerDocument.cumulativeStats.coinsCollected += delta.coinsCollected;
    playerDocument.cumulativeStats.fireballsShot += delta.fireballsShot;
    playerDocument.cumulativeStats.enemiesDefeated += delta.enemiesDefeated;
    playerDocument.cumulativeStats.flagPoleHeight = delta.flagPoleHeight;

    playerDocument.lastStatsSnapshot = { ...currentStats };

    // Update the gameplay state
    playerDocument.gameplay.states.push({
      timestamp: new Date().toISOString(),
      state: gameplayState,
    });

    console.log("Updated player document:", playerDocument);

    // Upsert the updated document
    await collection.upsert(playerId, playerDocument);

    res.status(200).json({ message: "Gameplay state updated successfully" });
  } catch (error) {
    console.error("Error updating gameplay state:", error);
    res.status(500).json({ error: "Failed to update gameplay state" });
  }
});

/**
 * Route to delete all players
 */
app.delete("/api/players/delete", async (req, res) => {
  try {
    const cluster = await connectCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope("_default");
    const collection = await getCollection();

    // Query to fetch all player IDs
    const query = `SELECT META().id AS id FROM \`${process.env.COUCHBASE_BUCKET}\``;
    const result = await cluster.query(query);

    // Delete each player document
    for (const row of result.rows) {
      await collection.remove(row.id);
    }

    res.status(200).json({ message: "All players deleted successfully" });
  } catch (error) {
    console.error("Error deleting all players:", error);
    res.status(500).json({ error: "Failed to delete all players" });
  }
});

/**
 * Route to delete a specific player by ID
 */
app.delete("/api/players/delete/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    const collection = await getCollection();

    // Delete the specific player document
    await collection.remove(playerId);

    res.status(200).json({ message: `Player with ID ${playerId} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting player with ID ${playerId}:`, error);
    res.status(500).json({ error: `Failed to delete player with ID ${playerId}` });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };
