import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {

}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    try {
        const user = await db.query(`SELECT * FROM customers WHERE id = $1`, [customerId]);
        if (user.rows.length === 0) return res.status(400).send("Usuário não encontrado");

        const game = await db.query(`SELECT * FROM games WHERE id = $1`, [gameId]);
        if (game.rows.length === 0) return res.status(400).send("Não existe o jogo");

        const stock = await db.query(`SELECT games."stockTotal" FROM games WHERE id = $1`, [gameId]);
        const rentalsThisGame = await db.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId]);
        if (stock.rows[0].stockTotal <= rentalsThisGame.rows.length) return res.status(400).send("Estoque indisponível");
        
        const priceGame = await db.query(`SELECT "pricePerDay" FROM games WHERE id = $1`, [gameId]);

        await db.query(`
        INSERT INTO rentals (
            "customerId", 
            "gameId", 
            "rentDate", 
            "daysRented", 
            "returnDate", 
            "originalPrice", 
            "delayFee"
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            customerId, 
            gameId, 
            dayjs(Date.now()).format('YYYY-MM-DD'), 
            daysRented, 
            null, 
            daysRented*priceGame.rows[0].pricePerDay,
            null
        ])

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postIdRentals(req, res) {

}

export async function deleteRentals(req, res) {

}