const app = require("./src/app");
const PORT = process.env.PORT || 3000;

const userRouter = require('./src/routes/users.route');
const profileRouter = require('./src/routes/userProfile.route');
const connectionRouter = require('./src/routes/userConnection.route');
const projectRouter = require('./src/routes/project.routes');

const http = require("http");
const { Server } = require("socket.io");

app.use(userRouter);
app.use(profileRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/project", projectRouter);

app.get('/', (req, res) => {
  res.send('Welcome to ProjectSphere server');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("Message:", data);

    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});