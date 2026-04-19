const app = require("./src/app");
const PORT = process.env.PORT || 3000;

const userRouter = require('./src/routes/users.route');
const profileRouter = require('./src/routes/userProfile.route');
const connectionRouter = require('./src/routes/userConnection.route');

app.use(userRouter);
app.use(profileRouter);
app.use("/api", connectionRouter);

app.get('/', (req, res) => {
  res.send('Welcome to ProjectSphere server');
});

app.listen(PORT, ()=>{
    console.log('server is running');
});