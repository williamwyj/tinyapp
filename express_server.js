const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { findUserEmail } = require('./helpers');



const generateRandomString = function() {
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 62)];
  }
  return output;
};

const urlsForUser = (user_Id) => {
  let outputURL = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === user_Id) {
      outputURL[URL] = urlDatabase[URL];
    }
  }
  return outputURL;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_Id',
  keys : ['key1','key2']
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2" : {
    longURL : "http://www.lighthouselabs.ca",
    userID : "userRandomID"
  },
  "9sm5xK" : {
    longURL : "http://www.google.com",
    userID : "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10)
  }
};

//redirect get request to "/" to '/urls' if logged in or '/login' if not logged in
app.get("/", (req, res) => {
  if (req.session.user_Id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//home page for user, display user's list of URL, if not loged in, display corresponding error msg.
app.get("/urls", (req,res) => {
  const user = users[req.session.user_Id];
  if (!user) {
    return res.status(400).send('Please login first');
  }
  const userURL = urlsForUser(user.id);
  const templateVars = { urls: userURL, user: user};
  res.render("urls_index", templateVars);
});

//page to create new short URL, if not logged in, redirect to login page
app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_Id];
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//page of each individual short url, returns error msg if user not logged in or does not own url
app.get('/urls/:shortURL', (req,res) => {
  const user = users[req.session.user_Id];
  if (!user) {
    return res.status(400).send('Please login first');
  }
  const userURL = urlsForUser(user.id);
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user
  };
  res.render("urls_show", templateVars);
});

//post request to general new shortURL for inputed long URL and store in databse
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['userID'] = req.session.user_Id;
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Post request to redirect user to long url when clicked on short url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Short URL does not exist');
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//post request to delete url, return error message if user not logged in or does not own the url
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_Id];
  if (!user) {
    return res.status(400).send('Please login first');
  }
  const userURL = urlsForUser(user.id);
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url');
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//post request to short URL page, return error message if user is not loggin in or does not own the url
app.post('/urls/:shortURL', (req,res) => {
  const user = users[req.session.user_Id];
  if (!user) {
    return res.status(400).send('Please login first');
  }
  const userURL = urlsForUser(user.id);
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url');
  }
  const shortURL = req.params.shortURL;
  const newLongURL = req.body;
  urlDatabase[shortURL]['longURL'] = newLongURL[shortURL];
  res.redirect('/urls');
});

//post request to login, return error message if email or password is wrong
app.post('/login', (req, res) => {
  const loginEmail = req.body['email'];
  const password = req.body['password'];
  const user = findUserEmail(loginEmail, users);
  if (!user) {
    return res.status(403).send('Account with this email does not exist');
  }
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_Id = user.id;
  } else {
    return res.status(403).send('Password does not match our records');
  }
  res.redirect('/urls');
});

//post request to logout, and delete cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//get request to register page
app.get('/register', (req, res) => {
  if (req.session.user_Id) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_register', user = null);
});

//post request to register a new account, return error if input fields are empty or information duplicate existing account
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = req.body;
  userInfo.password = bcrypt.hashSync(password,10);
  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }
  if (findUserEmail(email, users)) {
    return res.status(400).send('This email have already been registered');
  }

  const newId = generateRandomString();
  users[newId] = userInfo;
  users[newId]['id'] =  newId;
  req.session.user_Id = newId;
  res.redirect('/urls');
});

//get request to login page
app.get('/login', (req, res) => {
  if (req.session.user_Id) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_login', user = null);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});