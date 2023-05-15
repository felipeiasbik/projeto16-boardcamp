import { db } from "../database/database.connection.js";

export async function getGames(req, res) {
    const { name } = req.query;
    try {
        const queryName = await db.query(`SELECT * FROM games WHERE LOWER(name) LIKE LOWER($1)`, [name + '%']);
        // if (name && queryName.rows.length === 0) return res.sendStatus(404);
        if (name) return res.send(queryName.rows);

        const games = await db.query(`SELECT * FROM games`);
        res.send(games.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postGames(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;
    try {
        const findName = await db.query(`SELECT * FROM games WHERE name = $1`, [name]);
        if (findName.rows.length !== 0) return res.sendStatus(409);

        await db.query(`
        INSERT INTO games (name, image, "stockTotal", "pricePerDay")
        VALUES ($1, $2, $3, $4);`, 
        [name, image, stockTotal, pricePerDay]
        );

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}