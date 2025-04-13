const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const server = require("./app");

const DB = process.env.LIVE_DB.replace("<password>", process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 8000;
// listen on port
server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Listening on port ${PORT}...`);
  }
});
