const mongoose = require("mongoose");
const validator = require("validator");
const Rating = require("./Rating");

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
  },
  total_ratings: {
    type: Number
  },
  average_rating: {
    type: Number
  }
});


bookSchema.methods.CalcAverageRating = async function () {
  const book = this;

  const averageRating = await Rating.aggregate([
    
    {
      $group: {
        "_id": "$bookId",
        "averageRating": { 
          "$avg": {
            "$ifNull": ["$rating", 0]
          }
        },
        "count": {
          "$sum": 1
        }
      }
    }
  ]);

  console.log(averageRating);

  return {
    avg: averageRating[0].averageRating.toFixed(1),
    count: averageRating[0].count
  };
};


const Book = mongoose.model("Book", bookSchema);
module.exports = Book;