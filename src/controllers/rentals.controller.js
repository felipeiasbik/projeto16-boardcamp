import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
    const { customerId, gameId } = req.query;
    try {
        const queryCustomer = await db.query(`SELECT * FROM rentals WHERE "customerId" = $1`, [customerId ]);
        if (customerId && queryCustomer.rows.length === 0) return res.sendStatus(404);
        const newQueryCustomer = queryCustomer.rows.map( r => ({
            id: r.id,
            customerId: r.customerId,
            gameId: r.gameId,
            rentDate: dayjs(r.rentDate).format('YYYY-MM-DD'),
            daysRented: r.daysRented,
            returnDate: (r.returnDate !== null) ? dayjs(r.returnDate).format('YYYY-MM-DD') : null,
            originalPrice: r.originalPrice,
            delayFee: r.delayFee,
            customer: {
                id: r.idCustomer,
                name: r.idCustomerName,
            },
            game: {
                id: r.gameId,
                name: r.gameName,
            },
        }));
        if (customerId) return res.send(newQueryCustomer);
        const queryGame = await db.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId]);
        if (gameId && queryGame.rows.length === 0) return res.sendStatus(404);
        const newQueryGame = queryGame.rows.map( r => ({
            id: r.id,
            customerId: r.customerId,
            gameId: r.gameId,
            rentDate: dayjs(r.rentDate).format('YYYY-MM-DD'),
            daysRented: r.daysRented,
            returnDate: (r.returnDate !== null) ? dayjs(r.returnDate).format('YYYY-MM-DD') : null,
            originalPrice: r.originalPrice,
            delayFee: r.delayFee,
            customer: {
                id: r.idCustomer,
                name: r.idCustomerName,
            },
            game: {
                id: r.gameId,
                name: r.gameName,
            },
        }));
        if (gameId) return res.send(newQueryGame);

        const rentals = await db.query(`
        SELECT rentals.*, 
        customers.id AS "idCustomer", 
        customers.name AS "idCustomerName", 
        games.id AS "idGame", 
        games.name AS "gameName" FROM rentals 
        JOIN customers ON "customerId" = customers.id 
        JOIN games ON "gameId" = games.id
        `);

        const newRentals = rentals.rows.map( r => ({
            id: r.id,
            customerId: r.customerId,
            gameId: r.gameId,
            rentDate: dayjs(r.rentDate).format('YYYY-MM-DD'),
            daysRented: r.daysRented,
            returnDate: r.returnDate,
            originalPrice: r.originalPrice,
            delayFee: r.delayFee,
            customer: {
                id: r.idCustomer,
                name: r.idCustomerName,
            },
            game: {
                id: r.gameId,
                name: r.gameName,
            },
        }))

        res.send(newRentals);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    try {
        const user = await db.query(`SELECT * FROM customers WHERE id = $1`, [customerId]);
        if (user.rows.length === 0) return res.sendStatus(400);

        const game = await db.query(`SELECT * FROM games WHERE id = $1`, [gameId]);
        if (game.rows.length === 0) return res.sendStatus(400);

        const stock = await db.query(`SELECT games."stockTotal" FROM games WHERE id = $1`, [gameId]);
        const rentalsThisGame = await db.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId]);
        if (stock.rows[0].stockTotal <= rentalsThisGame.rows.length) return res.sendStatus(400);
        
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
    const { id } = req.params;

    try {
        const finalizeRent = await db.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if (finalizeRent.rows.length === 0 ) return res.sendStatus(404);
        if (finalizeRent.rows[0].returnDate !== null) return res.sendStatus(400);

        const dateNew = dayjs(Date.now());
        const dateOld = dayjs(finalizeRent.rows[0].rentDate);        
        const deliveryDate = dateOld.add(finalizeRent.rows[0].daysRented, "day").format('YYYY-MM-DD');
        const dateDif = dateNew.diff(deliveryDate);

        const delayFeeTotal = (finalizeRent.rows[0].originalPrice/finalizeRent.rows[0].daysRented)
        *Math.floor(dateDif / 86400000);
        
        await db.query(`
        UPDATE rentals 
        SET "returnDate" = $1, 
        "delayFee" = $2 
        WHERE id = $3`, 
        [dateNew, delayFeeTotal >= 0 ? delayFeeTotal : 0, id]
        );

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function deleteRentals(req, res) {
    const { id } = req.params;
    try{
        const idExists = await db.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if (idExists.rows.length === 0) return res.sendStatus(404);
        if (idExists.rows[0].returnDate === null) return res.sendStatus(400);

        await db.query(`DELETE FROM rentals WHERE id = $1`, [id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}