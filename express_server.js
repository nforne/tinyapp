const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser())

const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: [0/* secret keys */],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.set("view engine", "ejs");

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const users = { 
  "user1RandomID": {
    id: "userRandomID",
    username : 'username1', 
    email: "user1@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    username : 'username2',
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  Tukj: {
    username: 'Martin',
    email: 'wnforne@gmail.com',
    password: 'js;kfjdl;fkj',
    id: 'Tukj'
  }
}

// const usersdbIDs = Object.keys(users);

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const sampleUrlDB = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

// const urlDBKeys = Object.keys(urlDatabase);

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

let loginID = ''; // for granting access to other site resources

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const {flatUrlDB, generateRandomString} = require('./helperFunctions');

//--------------------------------------
const emailCheck = (email) => {
  const usersdbIDs = Object.keys(users);
  let outPut = false;
  for (let i of usersdbIDs) {
    if (users[i]['email'] === email) {
      outPut = true;
    } 
  }
  return outPut;
};

//--------------------------------------

const userID = () => { // to retrieve the user id using the loging email id
  const usersdbIDs = Object.keys(users);
  let userID = '';
  for (let i of usersdbIDs) {
    if (users[i]['email'] === loginID[0]) {
      userID = i;
    }
  }
  return userID;
};
//--------------------------------------

const querry_DB_By_ID = () => { // to retrieve only data of a particular user id
  let outPut = {} 
  const UID = userID();
  const urlDBKeys = Object.keys(urlDatabase);
  for (let i of urlDBKeys) {
    if (urlDatabase[i]['userID'] === UID) {
      outPut[i] = urlDatabase[i];
    }
  }
  return flatUrlDB(outPut);
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/", (req, res) => {
  res.send("Hello!");
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/register", (req, res) => {
  const templateVars = { urls: {}, email:''};
  res.render('user_registrationf', templateVars);
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post("/register", (req, res) => {  

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.send("<html><body>404 \n<b>Email or password field empty. Not optional, must be filled</b></body></html>\n");
    
  } else if (emailCheck(req.body.email)) {
    res.send("<html><body>404 \n<b>Email already in use by someone else! Try another.</b></body></html>\n");
    
  } else {
    let cookieValue = '';
    const usersdbIDs = Object.keys(users);
    while (true) { // check to make sure there is no userID duplication at auto generate
      let randomID = generateRandomString(4);
      if (!usersdbIDs.includes(randomID)) {  
      
        cookieValue = randomID;
        let bodyjson = req.body;
        bodyjson['id'] = randomID;
        bodyjson['password'] = bcrypt.hashSync(req.body.password, 10);
        users[randomID] = bodyjson
        loginID = [req.body.email];
        // console.log(users) 
        break;
      }
    }
    const templateVars = { urls: querry_DB_By_ID(), email: loginID[0]};
    // res.cookie('user_id', cookieValue /*, {httpOnly:true}*/);
    req.session.user_id = cookieValue;
    res.render('urls_index', templateVars);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post("/login", (req, res) => {  

  if (req.body.email && req.body.password) {
    const usersdbIDs = Object.keys(users);
    for (let i of usersdbIDs) {  
      console.log(bcrypt.compareSync(req.body.password, users[i]['password']))
      if (users[i]['email'] === req.body.email && bcrypt.compareSync(req.body.password, users[i]['password'])) {

        loginID = [users[i]['email']];        

        // res.cookie('user_id', users[i]['id'] /*, {httpOnly:true}*/);        
        req.session.user_id = users[i]['id'];
        const templateVars = {
          email: req.body.email,
          urls: querry_DB_By_ID()
        // ... any other vars
        };
        res.render("urls_index", templateVars);
      }
     }
  } else {
    loginID = '';
    req.session.user_id = null;
    res.render("urls_login",);
    
    // res.clearCookie('user_id')
    // res.redirect('/login')
    // res.render('urls_alert'); 
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/login", (req, res) => {
  res.render("urls_login");
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/urls", (req, res) => {  
  if (loginID[0]) {

    const templateVars = { urls: querry_DB_By_ID(), email: loginID[0]};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/urls/new", (req, res) => {
  if (loginID[0]) {    
    const templateVars = {
      email: loginID[0],
      urls: flatUrlDB(urlDatabase),
      // ... any other vars
    };
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login",);
  }
});
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get ('/public', (req, res) => {  // demo view
  const urlDBKeys = Object.keys(sampleUrlDB);
  let outPut = {};
  for (let i of urlDBKeys) {
    outPut[i] = sampleUrlDB[i]['longURL'];
  }
  const templateVars = { urls: outPut};
    res.render("urls_indexPublic", templateVars);
}) 

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post("/urls", (req, res) => {
  if (loginID[0] && req.body.longURL.length !== 0) {

    const urlDBKeys = Object.keys(urlDatabase);
    while (true) {      // to make sure there is no shortURL duplication
      let shortURL = generateRandomString(6);
      if (!urlDBKeys.includes(shortURL)) {
        urlDatabase[shortURL] = {'longURL': req.body.longURL, 'userID': userID()};
        // console.log(urlDatabase);
  
        res.redirect(`/urls/${shortURL}`);
        break;
      }
    }
  } else if (loginID[0]) {

  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post('/urls/:shortURL/update', (req, res) => { 
  if (loginID[0]) {

    const urlDBKeys = Object.keys(urlDatabase);
    let longURL = [flatUrlDB(urlDatabase)[req.params.shortURL]];  
    for (let i of urlDBKeys) {
      if (urlDatabase[i]['longURL'] === longURL[0]) {
        delete urlDatabase[i];
      }
    }
    
    while (true) { // check to make sure there is no shortURL duplication
      let shortURL = generateRandomString(6);
      
      if (!urlDBKeys.includes(shortURL)) {    
        
        urlDatabase[shortURL] = {'longURL':longURL[0],'userID': userID()};      
       
        res.redirect(`/urls/${shortURL}`);
        break;
      }
    }
  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post('/urls/:shortURL/delete', (req, res) => {
  if (loginID[0]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/u/:shortURL", (req, res) => {
  if (loginID[0]) {    
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/urls/:shortURL", (req, res) => {
  if (loginID[0]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], email: loginID[0],};
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_login",);
  } 
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/urls.json", (req, res) => {
  if (loginID[0]) {    
    res.json(urlDatabase);
  } else {
    res.render("urls_login",);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>