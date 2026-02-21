import pg from "pg";
const { Pool } = pg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Auto-create table
db.query(`
  CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    empname VARCHAR(255) NOT NULL,
    empage INTEGER NOT NULL,
    empdept VARCHAR(255) NOT NULL,
    photo VARCHAR(255)
  )
`).catch(e => console.error("DB init error:", e.message));

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const url = req.url || "";
    const method = req.method;
    const idMatch = url.match(/\/(\d+)(\?.*)?$/);
    const id = idMatch ? idMatch[1] : null;

    try {
        // GET /api/users
        if (method === "GET" && !id) {
            const { search, dept } = req.query || {};
            const conditions = [];
            const params = [];
            if (search) { params.push(`%${search}%`); conditions.push(`empname ILIKE $${params.length}`); }
            if (dept) { params.push(dept); conditions.push(`empdept = $${params.length}`); }
            const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
            const result = await db.query(`SELECT * FROM employee ${where} ORDER BY id`, params);
            return res.json({ users: result.rows, total: result.rows.length });
        }

        // GET /api/users/:id
        if (method === "GET" && id) {
            const result = await db.query("SELECT * FROM employee WHERE id = $1", [id]);
            if (!result.rows.length) return res.status(404).json({ error: "Not found" });
            return res.json(result.rows[0]);
        }

        // POST /api/users — body: { EmpName, EmpAge, EmpDept, photo (cloudinary URL) }
        if (method === "POST") {
            const { EmpName, EmpAge, EmpDept, photo } = req.body || {};
            if (!EmpName || !EmpAge || !EmpDept) return res.status(400).json({ error: "Missing fields" });
            const result = await db.query(
                "INSERT INTO employee (empname, empage, empdept, photo) VALUES ($1, $2, $3, $4) RETURNING id",
                [EmpName, EmpAge, EmpDept, photo || null]
            );
            return res.status(201).json({ id: result.rows[0].id, EmpName, EmpAge, EmpDept, photo });
        }

        // PUT /api/users/:id
        if (method === "PUT" && id) {
            const { EmpName, EmpAge, EmpDept, photo } = req.body || {};
            let finalPhoto = photo;
            if (!finalPhoto) {
                const existing = await db.query("SELECT photo FROM employee WHERE id = $1", [id]);
                finalPhoto = existing.rows[0]?.photo || null;
            }
            await db.query(
                "UPDATE employee SET empname=$1, empage=$2, empdept=$3, photo=$4 WHERE id=$5",
                [EmpName, EmpAge, EmpDept, finalPhoto, id]
            );
            return res.json({ id, EmpName, EmpAge, EmpDept, photo: finalPhoto });
        }

        // DELETE /api/users/:id
        if (method === "DELETE" && id) {
            await db.query("DELETE FROM employee WHERE id = $1", [id]);
            return res.json({ message: "Deleted" });
        }

        return res.status(404).json({ error: "Route not found" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
