var express = require("express")
var cors = require("cors")
var { createServer } = require("http")
var { Server } = require("socket.io")
var fs = require("fs")

var app = express()
var httpServer = createServer(app)
var io = new Server(httpServer, {
  cors: {
    origin: "https://zulkarneynyavas.github.io",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

app.use(cors())
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

// var clients = []

// io.sockets.on("connect", client => {

//   clients.push(client)

//   client.on("disconnect", () => {
//     clients.splice(clients.indexOf(client), 1)
//   })

// })

var datas = require("./index.json")
var users = datas.users
var rooms = datas.rooms

var array = [],
    idsnicks = {}

io.on("connection", socket => {

  console.log(io.sockets.adapter.rooms)

  // socket.on("send", function (data) {
    // if (io.sockets.connected[idsnicks[data.usr]] !== undefined) {
        // io.sockets.connected[idsnicks[data.usr]].emit("sendmsg", {
          // msg:data.msg,
          // usr:socket.username
        // })
    // }
  // })

  // socket.on("startchat", function (data) {
    // if (io.sockets.connected[idsnicks[data]] !== undefined) {
        // io.sockets.connected[idsnicks[data]].emit("openchat", socket.username)
    // }
  // })


  socket.on("login", username => {

    var emit = null

    users.forEach(p => {
      if (p.username == username) {
        array.push(username)
        socket.username = username
        idsnicks[username] = socket.id
        emit = p
      }
    })

    socket.emit("login", emit)
  })


  // socket.on("disconnect", function () {
  //   array.splice(array.indexOf(socket.username), 1)
  //   delete idsnicks[socket.username]
  // })


  socket.on("rooms", function (user) {

    var emit = []
  
    users.forEach(function(p) {
      if (p.username == user.username) {
          p.rooms.forEach(function(r, i) {
          emit.push(rooms[i])
        })
      }
    })
  
    io.emit("rooms", emit)
  })


  socket.on("room", function (roomId) {
    
    var emit = ""
  
    rooms.forEach(function(room, i) {
      if (room.id == roomId) {
        socket.join(room.id)
        emit = room
      }
    })
  
    socket.emit("room", emit)
  })


  socket.on("object", function (data) {
    rooms.forEach((room, i) => {
      if (room.id == data.room.id) {
        var index = rooms[i].objects.map((o) => o.id).indexOf(data.object.id)
        // console.log(rooms[i].objects[index])
      }
    })
  })


  socket.on("roomClick", (props) => {

    if (props.object) {

      const roomIndex   = rooms.map((o) => o.id).indexOf(props.room.id)
      const objectIndex = rooms[roomIndex].objects.map((o) => o.id).indexOf(props.object.id)

      let o = rooms[roomIndex].objects[objectIndex]

      var PF = require("pathfinding")
  
      var grid = new PF.Grid(props.room.w, props.room.h)
    
      var finder = new PF.AStarFinder({
        allowDiagonal: true
      })
      
      var path = finder.findPath(
        o.x, 
        o.y, 
        props.x, 
        props.y, 
        grid
      )

      path.shift()

      // console.log(io.engine.clients)
      
      var t

      // clearTimeout(t)

      path.forEach(function (p, i) {
        console.log(i);
        
        t = setTimeout(function () {
          // console.log(p)

          o.x = p[0]
          o.y = p[1]

          io.to(props.room.id).emit("room", rooms[roomIndex])

        }, i * (o.t * 100))

      })

      // fs.writeFile(fileName, JSON.stringify(rooms, null, 2), () => {})

    }

  })
  
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("foo", {
          "disconnected": socket.id
        })
      }
    }
  })

})



httpServer.listen(8080, function() {
  console.log("Server listening on 8080")
})

