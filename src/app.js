require("./db/mongoose");
const express = require("express");
const port = process.env.PORT || 3000;

// Routers
const userRouter = require("./routes/userRouter");
const bookRouter = require("./routes/bookRouter");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(bookRouter);



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});