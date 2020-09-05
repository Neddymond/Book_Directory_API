const Book = require("../models/Book");
const Rating = require("../models/Rating");
const express = require("express");
const router = new express.Router();
const auth = require("../Middleware/auth");

/** Endpoint for adding books */
router.post("/books/add", auth, async (req, res) => {
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

    let sum_of_all_ratings;

    for (let i = 0; i <= books.ratings.length; i++) {
      sum_of_all_ratings += books.ratings[i];
    }

    // calculate the average rating by dividing the sum of all ratings by the number of ratings
    const averageRating = (sum_of_all_ratings / book.ratings.length).toFixed(1);

    res.send({ books, averageRating });
  } catch (e) {
    res.status(500).end(e);
  }
});

router.post("/books/rate/:id", auth, async (req, res) => {
 try {
  const book = await Book.findById(req.params.id);

  // Check if a user rating already exists on a book
  const existingRating = await Rating.findOne({
    userId: req.user._id,
    bookId: book._id
  });

  // If a rating already exists, update it. Otherwise, create a new rating.
  if (existingRating) {
    existingRating["rating"] = req.body.rating;
    await existingRating.save();

    res.send(existingRating);
  } else {
    const rating = new Rating({
      rating: req.body.rating,
      userId: req.user._id,
      bookId: book._id
    });

    await rating.save();
    // console.log(rating);
  
    const bookRating = book.ratings.push(rating._id);
    await book.save();

    res.send(rating);
  }
 } catch (e) {
   res.status(500).send(e);
 }
});

/** Endpoint for updating a Book */
router.patch("/books/update/:id", auth, async (req, res) => {
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
router.delete("/books/del", auth, async (req, res) => {
  try {
    // delete all books
    const deletedBooks = await Book.find({}).deleteMany();

    res.send(deletedBooks);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;