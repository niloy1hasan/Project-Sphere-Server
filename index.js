const app = require("./src/app");
const PORT = process.env.PORT || 3000;

const userRouter = require('./src/routes/users.route');

app.use(userRouter);

app.get('/', (req, res) => {
  res.send('Welcome to ProjectSphere server');
});

app.listen(PORT, ()=>{
    console.log('server is running');
});