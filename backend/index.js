const express = require("express");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");


const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));



app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({ message: "Working Fine.." });
});



//Routes
app.use("/api/users", userRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

