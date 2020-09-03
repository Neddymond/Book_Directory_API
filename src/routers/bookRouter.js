const Book = require("../models/Books");
const express = require("express");
const router = new express.Router();
const hal = require("hal");

/** Endpoint for adding books */
router.post("/books/add", async (req, res) => {
  try {
    const book = new Book({ ...req.body });

    // Enter book in the db
    await book.save();

    // Resource
    let Books = new hal.Resource({ book }, "/books/add");

    // Links
    Books.link("all books","/books/all");
    Books.link("books by name and author", "/books/:name/:author");
    Books.link("delete books", "/books/del");

    res.status(201).send({ Books });
  } catch (e) {
    res.status(400).send(e);
  }
});

/** Endpoint for getting all books */
router.get("/books/all", async (req, res) => {
  const sort = {};

  /**
   * if sorting is applied to the query, 
   * determine whether it is ascending (1) or descending (-1)
   */
  if (req.query.sortBy) {
    const parts = req
      .query
      .sortBy
      .split(":");

    sort[parts[0]] = parts[1] === "desc"
     ? -1 
     : 1;
  }

  try {
    /**
     * Fetch all the books in the Book collection,
     * unless pagination and sorting is applied.
     */
    const books = await Book
      .find({})
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .sort(sort);

    if (books.length <= 0) {
      res.status(404).send("Directory currently empty");
    }

    let Books = new hal.Resource({ books }, "/books/all");

    // Links
    Books.link("add books","/books/add");
    Books.link("books by name and author", "/books/:name/:author");
    Books.link("delete books", "/books/del");

    res.send(Books);
  } catch (e) {
    res.status(500).end(e);
  }
});

/** Endpoint for getting books by parameter */
router.get("/books/:name/:author", async (req, res) => {
  try {
    let name = req.params.name;
    let authors = req.params.author;

    // query Book collection using book name and book authors
    const book = await Book.find({
      name,
      authors
    });

    if (book.length <= 0) {
      res.status(404).send("Book not found");
    }

    let Books = new hal.Resource({ book } , "/books/:name/:author");

    // Links
    Books.link("add books","/books/add");
    Books.link("all books","/books/all");
    Books.link("delete books", "/books/del");

    res.send(Books);
  } catch (e) {
    res.status(500).end(e);
  }
});

/** Endpoint for deleting books */
router.delete("/books/del", async (req, res) => {
  try {
    // delete all books
    const deletedBooks = await Book.find({}).deleteMany();

    let Books = new hal.Resource({ deletedBooks }, "/books/del");

    // Links
    Books.link("add books","/books/add");

    res.send(Books);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;