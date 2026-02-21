const db = require("../db");
const path = require("path");
const fsPromises = require("fs").promises;

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search, dept } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`empname ILIKE $${params.length}`);
    }
    if (dept) {
      params.push(dept);
      conditions.push(`empdept = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const usersResult = await db.query(`SELECT * FROM employee ${where} ORDER BY id`, params);
    const users = usersResult.rows;

    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user by id
const getSingleUserById = async (req, res) => {
  try {
    const { Id } = req.params;
    if (!Id) {
      return res.status(400).json({ error: "User Id required" });
    }
    const result = await db.query("SELECT * FROM employee WHERE id = $1", [Id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new user
const addUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    const photo = req.file ? req.file.filename : null;
    const result = await db.query(
      "INSERT INTO employee (empname, empage, empdept, photo) VALUES ($1, $2, $3, $4) RETURNING id",
      [EmpName, EmpAge, EmpDept, photo]
    );
    res.status(201).json({
      Id: result.rows[0].id,
      EmpName,
      EmpAge,
      EmpDept,
      photo,
    });
  } catch (error) {
    console.error("Error in addUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    let photo = req.file ? req.file.filename : null;

    // If no new photo uploaded, keep the old one
    if (!photo) {
      const existing = await db.query(
        "SELECT photo FROM employee WHERE id = $1",
        [req.params.Id]
      );
      if (existing.rows.length > 0) {
        photo = existing.rows[0].photo;
      }
    }

    const result = await db.query(
      "UPDATE employee SET empname = $1, empage = $2, empdept = $3, photo = $4 WHERE id = $5",
      [EmpName, EmpAge, EmpDept, photo, req.params.Id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ Id: req.params.Id, EmpName, EmpAge, EmpDept, photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const existing = await db.query(
      "SELECT photo FROM employee WHERE id = $1",
      [req.params.Id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = existing.rows[0];
    if (user.photo) {
      const photoPath = path.join(__dirname, "../uploads", user.photo);
      try {
        await fsPromises.unlink(photoPath);
      } catch (err) {
        console.error("Error deleting photo:", err.message);
      }
    }

    const result = await db.query(
      "DELETE FROM employee WHERE id = $1",
      [req.params.Id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, getSingleUserById, addUser, updateUser, deleteUser };