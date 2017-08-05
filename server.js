const express = require("express");
const app = express();
const router = express.Router();
const path = __dirname + '/views/';
const config = require('./config');

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.use("/",router);
app.use(express.static('public'))

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

// app.listen(3000,function(){
//   console.log("Live at Port 3000");
// });

if (module === require.main) {
  // Start the server
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}