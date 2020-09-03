const mongoose = require("mongoose");
const validator = require("validator");

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: [String],
    required: true,
    trim: true,
    validate(value) {
      if (value.length <= 0) {
        throw new Error("Authors can't be null");
      }
    }
  },
  pages: {
    type: Number,
    required: true,
    validator(value) {
      if (value <= 0) {
        throw new Error("Invalid book");
      }
    }
  }
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;