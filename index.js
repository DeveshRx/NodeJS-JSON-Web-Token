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
  console.log('/ -> Cookies: ')
  console.log(req.cookies);

  res.json({ cookies: req.cookies });
})

app.post('/verify', (req, res) => {
  console.log('/verify -> Verify: ')
  const token = req.cookies.token;

  console.log(req.cookies);

  // verify a token symmetric - synchronous
  var decoded = jwt.verify(token, 'shhhhh');
  console.log('decoded', decoded)
  res.json({
    cookies: req.cookies,
    decoded: decoded
  });

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
  const database = client.db("ExpDB");
  const med = database.collection("expdb");

  const data = {
    _id: 1234,
    fname: fname,
    lname: lname,
    email: email,
    password: myEncPassword
  };

  var newVal = { $set: data };


  await med.updateOne({ _id: Number(data._id) }, newVal, {
    upsert: true,
  });

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
  console.log("Gen Tokem: " + token);

  const user = { fname: fname, lname: lname, email: email, token: token };

  res.status(200).json(user);


})


app.post('/login', async (req, res) => {
  var encPassword = "";
  try {
    // get all data from user
    const { email, password } = req.body;

    // find user in db
    const database = client.db("ExpDB");
    const med = database.collection("expdb");

    const user = await med.findOne({ email: email });
    console.log("---\nuser", user);

    if (user != null) {
      encPassword = user.password;

    }

    if (encPassword == null) {
      res.send("email invalid");

    }
    // match password

    const isValid = await bcrypt.compare(password, encPassword);
    var token = "";
    if (isValid) {
      // create jwt token
      token = jwt.sign(
        {
          email: user.email,
        },
        'shhhhh',
        {
          expiresIn: '1h'
        }
      );
    }

    // send a token in user cookie
    console.log('Cookies: ')
    console.log(req.cookies);



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
