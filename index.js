const express = require('express')
const app = express()
const port = 3000
var cookieParser = require('cookie-parser')

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cookieParser());

const { client } = require('./lib/mongodb');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res) => {
  
  res.send('Hello World!')
})


app.post('/register', async (req, res) => {

  const { fname, lname, email, password } = req.body;

  if (!(fname && lname && email && password)) {
    res.status(400).send('error feild');
  }
  // check if user exist

  // encrypt password
  const myEncPassword = await bcrypt.hash(password, 10);

  // save the user in DB with enc password

  // generate token & send it
  var token = jwt.sign(
    {
      email: email
    },
    'shhhhh',
    {
      expiresIn: '2h'
    }
  );

  const user = { fname: fname, lname: lname, email: email, token: token };

  res.status(200).json(user);


})


app.post('/login', async (req, res) => {
  const encPassword = "";
  try {
    // get all data from user
    const { email, password } = req.body;

    // find user in db
    // ....
    // match password
    const isValid = await bcrypt.compare(password, encPassword);
    const token = "";
    if (isValid) {
      // create jwt token
      token = "xx"
    }

    // send a token in user cookie
    console.log('Cookies: ', req.cookies)


    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days, 24 hours, 60 min, 60 sec, 1000 mili
      httpOnly: true
    }

    res.status(200)
      .cookie("token", token, options)
      .json({ success: true, token: token });

  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
