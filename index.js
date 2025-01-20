var express = require("express")
var cors = require("cors")
var { createServer } = require("http")
var { Server } = require("socket.io")
var fs = require("fs")

var app = express()
var httpServer = createServer(app)
var io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

app.use(cors())
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

httpServer.listen(8080, function() {
  console.log("Server listening on 8080")
})

