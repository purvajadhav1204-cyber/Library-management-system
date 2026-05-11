const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const Payment = require("./models/Payment");

const app = express();
const PORT = 3000;

// middleware
app.get("/test-image", (req, res) => {
    res.sendFile(__dirname + "/public/images/gatsby.jpg");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "librarysecret",
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

// mongodb connection
mongoose.connect("mongodb://127.0.0.1:27017/librarydb")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// book model
const Book = require("./models/Book");

app.get("/", (req, res) => {
    res.render("login", { error: null });
});


// routes
app.get("/", async (req, res) => {
    const books = await Book.find();
    res.render("user", { books });
});

app.get("/admin", async (req, res) => {
    const books = await Book.find();
    res.render("admin", { books });
});

app.get("/add", (req, res) => {
    res.render("addBook");
});

app.get("/user", async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/");
    }
    const books = await Book.find();
    res.render("user", { books });
});

app.get("/admin", async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/");
    }
    const books = await Book.find();
    res.render("admin", { books });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/payment/:id", async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render("payment", { book });
});

app.post("/add", async (req, res) => {
    try {
        console.log(req.body); // IMPORTANT

        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            quantity: parseInt(req.body.quantity),
            price: parseInt(req.body.price),
            image: req.body.image
        });

        await newBook.save(); // THIS saves to MongoDB
        console.log("Book saved to DB");

        res.redirect("/admin");
    } catch (err) {
        console.log("ERROR:", err);
        res.send("Failed to save book");
    }
});
app.post("/delete/:id", async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
});

app.post("/issue/:id", async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (book.quantity > 0) {
        book.quantity -= 1;
        await book.save();
    }
    res.redirect("/admin");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        req.session.loggedIn = true;
        res.redirect("/user");
    } else {
        res.render("login", { error: "Invalid Credentials" });
    }
});

app.post("/payment", async (req, res) => {
    const payment = new Payment({
        username: req.body.username,
        bookTitle: req.body.bookTitle,
        amount: req.body.amount
    });

    await payment.save();
    res.redirect("/user");
});

app.post("/payment", async (req, res) => {
    try {
        const newPayment = new Payment(req.body);
        await newPayment.save();
        // Redirect back to user dashboard or home after success
        res.redirect("/user"); 
    } catch (err) {
        res.status(500).send("Error processing payment");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

