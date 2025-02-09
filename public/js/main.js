const submit = async function(event) {
    event.preventDefault();

    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const genre = document.querySelector("#genre").value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value || "None";
    const username = localStorage.getItem("username");

    const newBook = { title, author, genre, rating, username };

    try {
        const response = await fetch("/books", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
        });

        const updatedBooks = await response.json();
        renderBookList(updatedBooks);

        document.querySelector("#book-form").reset();
    } catch (error) {
        console.error("Error", error);
    }
};


const deleteBook = async function(event) {
    const bookId = event.target.getAttribute('data-id');

    try {
        const response = await fetch(`/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const updatedBooks = await response.json();
        renderBookList(updatedBooks);
    } catch (error) {
        console.error("Error", error);
    }
};

const editBook = function(event, bookId) {
    const row = event.target.closest('tr');
    const titleCell = row.querySelector('.book-title');
    const authorCell = row.querySelector('.book-author');
    const genreCell = row.querySelector('.book-genre');
    const ratingCell = row.querySelector('.book-rating');
    const statusCell = row.querySelector('.book-reading-status');
    const editButton = row.querySelector('.edit-btn');
    const saveButton = row.querySelector('.save-btn');

    titleCell.contentEditable = true;
    authorCell.contentEditable = true;
    genreCell.contentEditable = true;
    ratingCell.querySelector('.rating-section').style.display = "block";
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
};

const renderBookList = function(books) {
    const bookListBody = document.querySelector("#book-list tbody");
    bookListBody.innerHTML = '';

    books.forEach((book) => {
        const row = document.createElement('tr');
        row.classList.add("border-b", "border-yellow-900");

        row.innerHTML = `
            <td class="book-title text-yellow-900 text-lg px-6 py-3 border-b border-yellow-900">${book.title}</td>
            <td class="book-author text-yellow-900 text-lg px-6 py-3 border-b border-yellow-900">${book.author}</td>
            <td class="book-genre text-yellow-900 text-lg px-6 py-3 border-b border-yellow-900">${book.genre}</td>
            <td class="book-rating text-yellow-900 text-lg px-6 py-3 border-b border-yellow-900">
                <span class="rating-display">${book.rating === "None" ? "Not Rated" : book.rating}</span>
                <div class="rating-section" style="display: none;">
                    <input type="radio" name="rating${book._id}" value="1" ${book.rating === "1" ? "checked" : ""}>
                    <label for="rating1">1</label>
                    <input type="radio" name="rating${book._id}" value="2" ${book.rating === "2" ? "checked" : ""}>
                    <label for="rating2">2</label>
                    <input type="radio" name="rating${book._id}" value="3" ${book.rating === "3" ? "checked" : ""}>
                    <label for="rating3">3</label>
                    <input type="radio" name="rating${book._id}" value="4" ${book.rating === "4" ? "checked" : ""}>
                    <label for="rating4">4</label>
                    <input type="radio" name="rating${book._id}" value="5" ${book.rating === "5" ? "checked" : ""}>
                    <label for="rating5">5</label>
                </div>
            </td>
            <td class="book-reading-status text-yellow-900 text-lg px-6 py-3 border-b border-yellow-900">${book.readingStatus || "Not Read"}</td>
            <td class="px-6 py-3 border-b border-yellow-900">
                <button class="edit-btn bg-yellow-900 text-white px-4 py-2 rounded-lg" data-id="${book._id}">Edit</button>
                <button class="delete-btn bg-yellow-900 text-white px-4 py-2 rounded-lg" data-id="${book._id}">Delete</button>
                <button class="save-btn bg-yellow-900 text-white px-4 py-2 rounded-lg" data-id="${book._id}" style="display: none;">Save</button>
            </td>
        `;

        row.querySelector('.edit-btn').addEventListener('click', (e) => editBook(e, book._id));
        row.querySelector('.save-btn').addEventListener('click', (e) => saveBook(e, book._id));
        row.querySelector('.delete-btn').addEventListener('click', (e) => deleteBook(e));

        bookListBody.appendChild(row);
    });
};


const saveBook = async function(event, bookId) {
    const row = event.target.closest('tr');
    const title = row.querySelector('.book-title').innerText;
    const author = row.querySelector('.book-author').innerText;
    const genre = row.querySelector('.book-genre').innerText;
    const rating = row.querySelector('input[name="rating' + bookId + '"]:checked')?.value || "None";

    const updatedBook = { title, author, genre, rating };

    try {
        const response = await fetch(`/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBook),
        });

        const updatedBooks = await response.json();
        renderBookList(updatedBooks);
    } catch (error) {
        console.error("Error updating book", error);
    }
};

const loadBooks = async function() {
    const username = localStorage.getItem("username");

    try {
        const response = await fetch(`/books?username=${username}`);
        const books = await response.json();
        renderBookList(books);
    } catch (error) {
        console.error("Error loading books.", error);
    }
};



document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        if (username && password) {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem("username", username);
                    window.location.href = "collection.html";
                } else {
                    alert("Login failed");
                }
            } catch (error) {
                console.error("Error logging in:", error);
                alert("An error occurred during login.");
            }
        } else {
            alert("Please enter a username and password.");
        }
    });

    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem("username");
            window.location.href = "index.html";
        });
    }

});

window.onload = function() {
    const form = document.querySelector("#book-form");
    form.addEventListener('submit', submit);
    loadBooks();
};
