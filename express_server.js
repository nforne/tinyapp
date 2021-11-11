const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");

const users = { 
  "user1RandomID": {
    id: "userRandomID",
    username : 'username1', 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    username : 'username2',
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const usersdbIDs = Object.keys(users);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let loginID = ''; // necessary ot grant prevelege to other site resources

function generateRandomString(n) {
  const nums_letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const alphanumeric = nums_letters.split('');
  let key = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * 62);
    key += alphanumeric[index];
  }
  return key;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: {}, username:''};
  res.render('user_registrationf', templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body.email.length);

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.send("<html><body>404 \n<b>Email or password field empty. Not optional, must be filled</b></body></html>\n");
    
  } else {
    while (true) { // check to make sure there is no userID duplication at auto generate
      let randomID = generateRandomString(4);
      if (!usersdbIDs.includes(randomID)) {      
        let bodyjson = req.body;
        bodyjson['id'] = randomID;
        users[randomID] = bodyjson
        loginID = [req.body.username];
        console.log(users)
        break;
      }
    }
    const templateVars = { urls: urlDatabase, username: loginID[0]};
    res.cookie('username', req.body.username /*, {httpOnly:true}*/);
    res.render('urls_index.ejs', templateVars);
  }


});

app.post("/login", (req, res) => {
  // console.log(req.body)

  if (req.body.username) {
    for (let i of usersdbIDs) {
      if (users[i]['username'] === String(req.body.username)) {

        loginID = [users[i]['username']];        

        res.cookie('username', req.body.username /*, {httpOnly:true}*/);
        const templateVars = {
          username: req.body.username,
          urls: urlDatabase
        // ... any other vars
        };
        res.render("urls_index", templateVars);
      }
     }
  } else {
    loginID = '';
    res.clearCookie('username');
    const templateVars = { urls: {}, username:''};
    
    // console.log(users);
    
    res.render("urls_index", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (loginID[0]) {    
    const templateVars = { urls: urlDatabase, username: loginID[0]};
    res.render("urls_index.ejs", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (loginID[0]) {    
    const templateVars = {
      username: loginID[0],
      urls: urlDatabase
      // ... any other vars
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let urlDBKeys = Object.keys(urlDatabase);
  while (true) { // check to make sure there is no shortURL duplication
    let shortURL = generateRandomString(6);
    if (!urlDBKeys.includes(shortURL)) {
      urlDatabase[shortURL] = req.body.longURL;
      res.redirect(`/urls/${shortURL}`);
      // console.log(urlDatabase);
      break;
    }
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  let urlDBKeys = Object.keys(urlDatabase);
  let longURL = [String(urlDatabase[req.params.shortURL])];
  for (let i of urlDBKeys) {
    if (urlDatabase[i] === longURL[0]) {
      delete urlDatabase[i];
    }
  }
  while (true) { // check to make sure there is no shortURL duplication
    let shortURL = generateRandomString(6);
    if (!urlDBKeys.includes(shortURL)) {
      urlDatabase[shortURL] = longURL[0];
      res.redirect(`/urls/${shortURL}`);
      // console.log(urlDatabase);
      break;
    }
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (loginID[0]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: loginID[0],};
    res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});