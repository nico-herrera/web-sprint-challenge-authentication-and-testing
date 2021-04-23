const router = require('express').Router();
const Users = require('./auth-model');
const db = require('../../data/dbConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secret = process.env.SECRET || "shh";

const checkUsernameExists = async (req, res, next) => {
  try {
    const username = req.body.username;
    const user = await db.select('username').from("users").where({username});
    if (user.length >= 1) {
      res.status(422).json({message: "Username taken"})
    } else {
      next();
    }
  } catch (err) {
    next(err)
  }
}

async function checkUsernameNotExists(req, res, next) {
  try {
    const username = req.body.username;
    const user = await db.select("username").from('users').where({username}).first()
    if (user.length === 0) {
      res.status(401).json({message: "invalid credentials."})
    } else {
      next();
    }
  } catch (err) {
    next(err);
    }
  }


router.post('/register', checkUsernameExists, async (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
      const credentials = req.body;
      
      try {
        if (!credentials) {
          res.status(400).json({message: "username and password required."})
        }
        const hash = bcrypt.hashSync(credentials.password, 5);
        credentials.password = hash;

        const user = await Users.insert(credentials);
        const token = generateToken(user)
        res.status(201).json(user)
      } catch (err) {
        next(err)
      }

});

router.post('/login', checkUsernameNotExists, async (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */

      const {username, password} = req.body;

      try {
        if (!req.body) {
          res.status(400).json({message: "username and password required."})
        }
        const user = await Users.findBy({username});
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
          res.status(200).json({message: `welcome, ${user.username}`, token})
        } else {
          res.status(401).json({message: "invalid credentials."})
        }
      } catch (err) {
        next(err)
      }
});

const generateToken = (user) => {
  const paylod = {
    subject: user.id,
    username: user.username
  }

  const options = {
    expiresIn: "1d"
  }

  const token = jwt.sign(paylod, secret, options);

  return token;
}

module.exports = router;
