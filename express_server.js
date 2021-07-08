const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');


function generateRandomString() {
  let output = '';
  for (i = 0;i < 6;i++) {
    output += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 62)]
  }
  return output;
}

function findUser(user_Id) {
  for (const userId in users) {
    const user = users[userId];
    if (user.id === user_Id){
      return user;
    }
  }
  return null;
}

function findUserEmail(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const urlsForUser = (user_Id) => {
  let outputURL = {};
  for (const URL in urlDatabase) {
    if(urlDatabase[URL].userID === user_Id){
      outputURL[URL] = urlDatabase[URL]
    }
  }
  return outputURL;
}

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
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
}

app.get("/", (req, res) => {
  if(req.session.user_Id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls", (req,res) => {
  const user = findUser(req.session.user_Id)
  if (!user) {
    return res.status(400).send('Please login first');
  }
  const userURL = urlsForUser(user.id)
  console.log(userURL)
  const templateVars = { urls: userURL, user: user};
  res.render("urls_index", templateVars);
})

app.get('/urls/new', (req, res) => {
  const user = findUser(req.session.user_Id)
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
})

app.get('/urls/:shortURL', (req,res) => {
  const user = findUser(req.session.user_Id)
  if(!user) {
    return res.status(400).send('Please login first')
  }
  const userURL = urlsForUser(user.id)
  if(!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url')
  }
  templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user
  };
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['userID'] = req.session.user_Id;
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Short URL does not exist')
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const user = findUser(req.session.user_Id)
  if(!user) {
    return res.status(400).send('Please login first')
  }
  const userURL = urlsForUser(user.id)
  if(!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url')
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req,res) => {
  const user = findUser(req.session.user_Id)
  if(!user) {
    return res.status(400).send('Please login first')
  }
  const userURL = urlsForUser(user.id)
  if(!userURL[req.params.shortURL]) {
    return res.status(400).send('You do not have this url')
  }
  const shortURL = req.params.shortURL;
  const newLongURL = req.body;
  //console.log(newLongURL[shortURL])
  urlDatabase[shortURL]['longURL'] = newLongURL[shortURL];
  res.redirect('/urls')
})

app.post('/login', (req, res) => {
  const loginEmail = req.body['email'];
  const password = req.body['password'];
  const user = findUserEmail(loginEmail, users);
  if (!user) {
    return res.status(403).send('Account with this email does not exist')
  }
  if (bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
  } else {
    return res.status(403).send('Password does not match our records')
  }
  //console.log(req.body)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.session = null;
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  res.render('urls_register', user = null);
});

app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userInfo = req.body;
    userInfo.password = bcrypt.hashSync(password,10);
    if(!email || !password) {
      return res.status(400).send('email and password cannot be blank');
    }
    if (findUserEmail(email, users)) {
      return res.status(400).send('This email have already been registered');
    }

    const newId = generateRandomString()
    users[newId] = userInfo;
    users[newId]['id'] =  newId;
    req.session.user_Id = newId;
    res.redirect('/urls')
});

app.get('/login', (req, res) => {
  res.render('urls_login', user = null);
})

// app.get('/u/:id', (req, res) => {

// })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})