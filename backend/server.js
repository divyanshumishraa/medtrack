const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = 8080;

const SECRET = "medtrack_secret_key";

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./medtrack.db");

console.log("Connected to SQLite database.");

db.serialize(() => {
    // Users table

    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

    // Devices table

    db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      quantity INTEGER,
      status TEXT
    )
  `);

    // Create demo user

    const password = bcrypt.hashSync(
        "admin123",
        10
    );

    db.run(
        `
    INSERT OR IGNORE INTO users(email, password)
    VALUES (?, ?)
    `,
        ["admin@medtrack.com", password]
    );
});

// Middleware

const verifyToken = (
    req,
    res,
    next
) => {
    const token =
        req.headers.authorization;

    if (!token) {
        return res
            .status(401)
            .json({
                message: "No token",
            });
    }

    try {
        const verified = jwt.verify(
            token,
            SECRET
        );

        req.user = verified;

        next();
    } catch {
        res
            .status(401)
            .json({
                message: "Invalid token",
            });
    }
};

// Login

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        `
    SELECT * FROM users WHERE email = ?
    `,
        [email],
        async (err, user) => {
            if (err || !user) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Invalid credentials",
                    });
            }

            const valid =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!valid) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Invalid credentials",
                    });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                },
                SECRET,
                {
                    expiresIn: "1d",
                }
            );

            res.json({
                token,
            });
        }
    );
});

// Protected Devices Routes

app.get(
    "/devices",
    verifyToken,
    (req, res) => {
        db.all(
            `
      SELECT * FROM devices
      `,
            [],
            (err, rows) => {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            error:
                                err.message,
                        });
                }

                res.json(rows);
            }
        );
    }
);

app.post(
    "/devices",
    verifyToken,
    (req, res) => {
        const {
            name,
            quantity,
            status,
        } = req.body;

        db.run(
            `
      INSERT INTO devices(name, quantity, status)
      VALUES (?, ?, ?)
      `,
            [name, quantity, status],
            function (err) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            error:
                                err.message,
                        });
                }

                res.json({
                    id: this.lastID,
                });
            }
        );
    }
);

app.put(
    "/devices/:id",
    verifyToken,
    (req, res) => {
        const { id } = req.params;

        const {
            name,
            quantity,
            status,
        } = req.body;

        db.run(
            `
      UPDATE devices
      SET name = ?, quantity = ?, status = ?
      WHERE id = ?
      `,
            [
                name,
                quantity,
                status,
                id,
            ],
            function (err) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            error:
                                err.message,
                        });
                }

                res.json({
                    message:
                        "Device updated",
                });
            }
        );
    }
);

app.delete(
    "/devices/:id",
    verifyToken,
    (req, res) => {
        const { id } = req.params;

        db.run(
            `
      DELETE FROM devices
      WHERE id = ?
      `,
            [id],
            function (err) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            error:
                                err.message,
                        });
                }

                res.json({
                    message:
                        "Device deleted",
                });
            }
        );
    }
);

app.listen(PORT, () => {
    console.log(
        `Server running on ${PORT}`
    );
});
