const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')


app.set("view engine", "ejs");

// const urlDatabase = require('./db')
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const nums_letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const alphanumeric = nums_letters.split('');
  let key = "";
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * 62);
    key += alphanumeric[index];
  }
  return key;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/login", (req, res) => {
  console.log(req.body)
  
  res.cookie('username', req.body.username /*, {httpOnly:true}*/);
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.body.username};
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let urlDBKeys = Object.keys(urlDatabase);
  while(true) { // check to make sure there is no shortURL duplication
    let shortURL = generateRandomString();
    if (!urlDBKeys.includes(shortURL)) {
      urlDatabase[shortURL] = req.body.longURL;
      res.redirect(`/urls/${shortURL}`)
      console.log(urlDatabase);
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
  while(true) { // check to make sure there is no shortURL duplication
    let shortURL = generateRandomString();
    if (!urlDBKeys.includes(shortURL)) {
      urlDatabase[shortURL] = longURL[0];
      res.redirect(`/urls/${shortURL}`)
      console.log(urlDatabase);
      break;
    }
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.body.username,};
  res.render("urls_show", templateVars);
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