const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const methodOverride = require('method-override')
app.use(methodOverride('_method'))  // override with POST having ?_method=DELETE

//--------------------------------------------------------------------------

app.set("view engine", "ejs");

//--------------------------------------------------------------------------

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

//--------------------------------------------------------------------------

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
      urlUseCount:0
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW",
      urlUseCount:0
  }
};

const sampleUrlDB = { // for demo on the front page Tinyapp
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

//--------------------------------------------------------------------------

let loginID = []; // for granting access to other site resources by signInCheck

const signInCheck = (req) => {
  if (req.session.user_id && loginID.includes(req.session.user_id)) {
    return true;
  } else {
    return false;
  }
}

//--------------------------------------------------------------------------

const {flatUrlDB, generateRandomString, emailCheck, fetchEmailById, querry_DB_By_ID } = require('./helpers');

//--------------------------------------------------------------------------

app.get("/register", (req, res) => {
  const templateVars = { script : null};
  res.render('user_registrationf', templateVars);
});

//--------------------------------------------------------------------------

app.post("/register", (req, res) => {  

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    const templateVars = {
      script : '404 Oops! Email or password field empty. Not optional, must be filled. Thank you!'
    }    
    res.render('user_registrationf', templateVars);
        
  } else if (emailCheck(req.body.email, users)) {
    const templateVars = {
      script : '404 Oops! Email already in use by someone else! Try another. Thank you!'
    }    
    res.render('user_registrationf', templateVars);
    
    
  } else {
    let cookieValue = '';
    const usersdbIDs = Object.keys(users);

    while (true) { // a check to make sure there is no userID duplication at auto generate
      let randomID = generateRandomString(4);
      if (!usersdbIDs.includes(randomID)) {       
        let bodyjson = req.body;
        bodyjson['id'] = randomID;
        bodyjson['password'] = bcrypt.hashSync(req.body.password, 10);
        users[randomID] = bodyjson
        loginID.push(randomID);
        cookieValue = randomID;
        break;
      }
    }
    const templateVars = { urls: querry_DB_By_ID(cookieValue, urlDatabase), email: req.body.email};
    req.session.user_id = cookieValue;
    res.render('urls_index', templateVars);
  }
});

//--------------------------------------------------------------------------

app.post("/login", (req, res) => {  

  if (req.body.email && req.body.password) {
    const usersdbIDs = Object.keys(users);
    for (let i of usersdbIDs) {  
      if (users[i]['email'] === req.body.email && bcrypt.compareSync(req.body.password, users[i]['password'])) {

        loginID.push(users[i]['id']);

        req.session.user_id = users[i]['id'];
        const templateVars = {
          email: req.body.email,
          urls: querry_DB_By_ID(req.session.user_id, urlDatabase)      
        }
        res.render("urls_index", templateVars);
      }
     }
  } else if (signInCheck(req)) {
      loginID.splice(loginID.indexOf(req.session.user_id), 1);
      req.session = null;
      res.render("urls_login");
  } else {
    const templateVars = {
      script : '403 Oops! Register or Login properly before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get("/login", (req, res) => {
  const templateVars = {script: null};
  res.render("urls_login", templateVars);
});

//--------------------------------------------------------------------------

app.get("/", (req, res) => {
  if (signInCheck(req)) {
    const templateVars = { urls: querry_DB_By_ID(req.session.user_id, urlDatabase), email: fetchEmailById(req.session.user_id, users)};
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);       
  }
  
});

//--------------------------------------------------------------------------

app.get("/urls", (req, res) => {  
  if (signInCheck(req)) {
    const templateVars = { urls: querry_DB_By_ID(req.session.user_id, urlDatabase), email: fetchEmailById(req.session.user_id, users)};
    res.render("urls_index", templateVars);
  } else {    
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get("/urls/new", (req, res) => {
  if (signInCheck(req)) {    
    const templateVars = {
      email: fetchEmailById(req.session.user_id, users),
      urls: flatUrlDB(urlDatabase)  //----------------------------------------------------------
    };
    res.render("urls_new", templateVars);
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.post("/urls", (req, res) => {
  if (signInCheck(req) && req.body.longURL.length !== 0) {

    const urlDBKeys = Object.keys(urlDatabase);
    while (true) {      // to make sure there is no shortURL duplication
      let shortURL = generateRandomString(6);
      if (!urlDBKeys.includes(shortURL)) {
        urlDatabase[shortURL] = {'longURL': req.body.longURL, 'userID': req.session.user_id, 'urlUseCount': 0};
          
        res.redirect(`/urls/${shortURL}`);
        break;
      }
    }
  } else if (signInCheck(req)) {

  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.put('/urls/:shortURL/update', (req, res) => { 
  if (signInCheck(req) && req.session.user_id === urlDatabase[req.params.shortURL]['userID']) { // only owners have create update and delete powers

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
        
        urlDatabase[shortURL] = {'longURL':longURL[0],'userID': req.session.user_id, 'urlUseCount':0};      
       
        res.redirect(`/urls/${shortURL}`);
        break;
      }
    }
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.delete('/urls/:shortURL/delete', (req, res) => {
  if (signInCheck(req)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get("/u/:shortURL", (req, res) => {
  if (signInCheck(req)) {    
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get("/urls/:shortURL", (req, res) => {
  if (signInCheck(req) && req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], email: fetchEmailById(req.session.user_id, users)};
    res.render("urls_show", templateVars);
  } else if (signInCheck(req)) {
    res.redirect(urlDatabase[req.params.shortURL]['longURL'])
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get("/urls.json", (req, res) => {
  if (signInCheck(req)) {    
    res.json(urlDatabase);
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
});

//--------------------------------------------------------------------------

app.get ('/public', (req, res) => {  // demo view
  const urlDBKeys = Object.keys(sampleUrlDB);  //--------------------------------------------------
  let outPut = {};
  for (let i of urlDBKeys) {
    outPut[i] = sampleUrlDB[i]['longURL'];
  }
  if (signInCheck(req)) {
    const templateVars = { urls: outPut, email: fetchEmailById(req.session.user_id, users)};
    res.render("urls_indexPublic", templateVars);
  } else {
    const templateVars = { urls: outPut, email: null};
    res.render("urls_indexPublic", templateVars);
  }
}) 
//--------------------------------------------------------------------------

app.post('/urlUseCount', (req, res) => {
  if (signInCheck(req) && req.body.shortURL) { //-------------------------to track url use for analytics-------------------------------
    urlDatabase[req.body.shortURL]['urlUseCount'] += 1;
  } else {
    const templateVars = {
      script : '403 Oops! Return to Registration or Login before.... Thank you!'
    }    
    res.render('urls_login', templateVars);
  }
})


//--------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//--------------------------------------------------------------------------