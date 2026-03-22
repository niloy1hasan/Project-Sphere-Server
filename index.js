const app = require("./src/app");
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send('Hello! This is my first Express server.');
});

app.listen(PORT, ()=>{
    console.log('server is running');
});