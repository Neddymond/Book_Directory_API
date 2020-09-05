const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 0 || value > 5) {
        throw new Error ("rating should be from one to five");
      }
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  }
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;