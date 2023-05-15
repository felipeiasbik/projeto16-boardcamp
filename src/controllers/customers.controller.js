import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function getCustomers(req, res) {
    const { cpf } = req.query;
    try {
        const queryCpf = await db.query(`SELECT * FROM customers WHERE cpf LIKE $1`, [cpf + '%']);
        if (cpf && queryCpf.rows.length === 0) return res.sendStatus(404);
        const newQueryCpf = queryCpf.rows.map ( r => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            cpf: r.cpf,
            birthday: dayjs(r.birthday).format('YYYY-MM-DD')
        }));
        if (cpf) return res.send(newQueryCpf);

        const getCustomers = await db.query(`SELECT *, to_char(birthday, 'YYYY-MM-DD') AS birthday FROM customers`);
        res.send(getCustomers.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getIdCustomer(req, res) {
    const { id } = req.params;
    try{
        const user = await db.query(`SELECT *, to_char(birthday, 'YYYY-MM-DD') AS birthday FROM customers WHERE id = $1`, [id]);
        if(user.rows.length === 0) return res.sendStatus(404);

        res.send(user.rows[0]);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    try {
        const findCpf = await db.query(`SELECT * FROM customers WHERE cpf = $1`, [cpf]);
        if (findCpf.rows.length !== 0) return res.sendStatus(409);

        await db.query(`
        INSERT INTO customers (name, phone, cpf, birthday) 
        VALUES ($1, $2, $3, $4)`, 
        [name, phone, cpf, birthday]
        );

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function putCustomer(req, res) {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    try {
        const user = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        if (user.rows.length === 0) return res.sendStatus(404);

        const cpfExists = await db.query(`SELECT * FROM customers WHERE cpf = $1 AND id != $2`, [cpf, id]);
        if (cpfExists.rows.length !== 0) return res.sendStatus(409);

        await db.query(`
        UPDATE customers 
        SET name = $1, phone = $2, cpf = $3, birthday = $4 
        WHERE id = $5`, [name, phone, cpf, birthday, id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}