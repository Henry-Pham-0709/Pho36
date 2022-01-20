const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate");


app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/menu", (req, res) => {
    res.render("menu")
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Connection to port ${port} success`)
})