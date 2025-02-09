const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express();

app.use(express.static('public'));
app.use(express.json());

const url = "mongodb+srv://mefrattasio:CeceLucy@cluster0.3gcgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbconnect = new MongoClient(url);
let collection = null;
let collection2 = null;

async function run() {
    await dbconnect.connect().then(() => console.log("Connected!"));
    collection = await dbconnect.db("cs4241").collection("books");
    collection2 = await dbconnect.db("cs4241").collection("users");

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;

        if (username && password) {
            try {
                const existingUser = await collection2.findOne({ username });

                if (!existingUser) {

                    const newUser = { username, password, createdAt: new Date() };
                    await collection2.insertOne(newUser);
                    return res.json({ success: true, message: "User logged in" });
                } else {

                    if (existingUser.password === password) {
                        return res.json({ success: true, message: "User logged in" });
                    } else {
                        return res.status(400).json({ error: "Wrong password" });
                    }
                }
            } catch (error) {
                res.status(500).json({ error: "Failed to log in" });
            }
        } else {
            res.status(400).json({ error: "Username and password required" });
        }
    });

    app.post('/books', async (req, res) => {
        const { title, author, genre, rating } = req.body;
        const username = req.body.username;
        const readingStatus = rating === "None" ? "Not Read" : "Read";

        const newBook = {title, author, genre, rating, readingStatus, username};

        try {
            const result = await collection.insertOne(newBook);
            const userBooks = await collection.find({ username }).toArray();
            res.json(userBooks);
        } catch (error) {
            res.status(500).json({ error: "Failed to add book" });
        }
    });


    app.put('/books/:id', async (req, res) => {
        const bookId = req.params.id;
        const { title, author, genre, rating } = req.body;
        const readingStatus = rating === "None" ? "Not Read" : "Read";

        const updatedBook = {title, author, genre, rating, readingStatus};

        try {
            const result = await collection.updateOne(
                { _id: new ObjectId(bookId) },
                { $set: updatedBook }
            );

            const allBooks = await collection.find({}).toArray();
            res.json(allBooks);
        } catch (error) {
            res.status(500).json({ error: "Failed to update book" });
        }
    });
    app.get('/books', async (req, res) => {
        const username = req.query.username;

        try {
            const userBooks = await collection.find({ username }).toArray();
            res.json(userBooks);
        } catch (error) {
            res.status(500).json({ error: "Failed to get books" });
        }
    });


    app.delete('/books/:id', async (req, res) => {
        const bookId = req.params.id;

        try {
            await collection.deleteOne({ _id: new ObjectId(bookId) });
            const books = await collection.find({}).toArray();
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: "Failed to delete book" });
        }
    });
}

const appRun = run();

app.listen(3000);






