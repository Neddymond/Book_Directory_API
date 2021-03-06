const Book = require("../models/Book");
const Rating = require("../models/Rating");
const express = require("express");
const router = new express.Router();
const auth = require("../Middleware/auth");

/** Endpoint for adding books */
router.post("/book", auth, async (req, res) => {
  try {
    const book = new Book({
      ...req.body
    });

    // Enter book in the db
    await book.save();

    res.status(201).send({ book });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/book/rate/:id", auth, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id
    });

    // Check if a user rating already exists on a book
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      bookId: book._id
    });

    // If a rating already exists, update it. Otherwise, create a new rating.
    if (existingRating) {
      existingRating["rating"] = req.body.rating;
      await existingRating.save();

      // calculate and update book's average_rating
      const { avg } = await book.CalcAverageRating();
      book.average_rating = avg;

      await book.save();

      res.send(existingRating);
    } else {
      // new Rating
      const rating = new Rating({
        rating: req.body.rating,
        userId: req.user._id,
        bookId: book._id
      });

      await rating.save();
      
      // calculate and assign book's average_rating and total_rating.
      const { avg, count } = await book.CalcAverageRating();
      book.total_ratings = count;
      book.average_rating = avg;

      await book.save();

      res.send(rating);
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

/** Endpoint for getting all books */
router.get("/books", async (req, res) => {
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

    res.send(books);
  } catch (e) {
    res.status(500).end(e);
  }
});

/** Endpoint for updating a Book */
router.put("/book/:id", auth, async (req, res) => {
  try {
    // All attributes we want to modify
    const reqBody = Object.keys(req.body);

    // Properties we can update
    const updateables = ["name", "authors", "pages"];

    // Make sure we are only updating updateable properties
    const isUpdateable = reqBody.every((property) => updateables.includes(property));

    if (!isUpdateable) {
      return res.status(400).send({ Error: "Invalid update"});
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).send()
    }

    reqBody.forEach((property) => book[property] = req.body[property]);

    await book.save();

    res.send(book);
  } catch (e) {
    res.status(500).send(e);
  }
});

/** Endpoint for deleting books */
router.delete("/book/:id", auth, async (req, res) => {
  try {
    // find and delete a book
    const deletedBook = await Book.findOneAndDelete({ _id: req.params.id });

    res.send(deletedBook);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;