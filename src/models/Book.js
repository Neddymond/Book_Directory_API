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
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rating",
  }],
  average_rating: {
    type: Number
  }
});


bookSchema.methods.CalcAverageRating = async function (bookId) {
  const book = this;

  const averageRating = await Rating.aggregate([
    {
      $group: {
        "_id": `${bookId}`,
        "averageRating": { 
          "$avg": {
            "$ifNull": ["$rating", 0]
          }
        }
      }
    }
  ]);

  return averageRating[0].averageRating.toFixed(1);
};

bookSchema.pre("save", function(next) {
  const book = this;
  // const averageRating;

  // if (book.isModified("ratings")) {
  //   const sum_of_all_ratings;

  //   for (let i = 0; i <= book.ratings.length; i++) {
  //     sum_of_all_ratings += book.ratings[i];
  //   }

  //   // calculate the average rating by dividing the sum of all ratings by the number of ratings
  //   averageRating = sum_of_all_ratings / book.ratings.length;
  // }

  // book.averageRating = averageRating.toFixed(1);

  next();
});



const Book = mongoose.model("Book", bookSchema);
module.exports = Book;