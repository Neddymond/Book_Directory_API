require("./db/mongoose");
const express = require("express");
const port = process.env.PORT || 3000;

// Routers
const userRouter = require("./routers/userRouter");
const bookRouter = require("./routers/bookRouter");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(bookRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});