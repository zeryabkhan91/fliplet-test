const express = require('express');
const ExpressBrute = require('express-brute');

const bruteForceMap = new Map();

function createOrUseBruteForce(namespace, freeRetries, minWait) {
  if (bruteForceMap.has(namespace)) {
    return bruteForceMap.get(namespace);
  } else {
    const store = new ExpressBrute.MemoryStore();
    const bruteforce = new ExpressBrute(store, {
      freeRetries,
      minWait,
    });

    bruteForceMap.set(namespace, bruteforce);
    return bruteforce;
  }
}

function bruteforce(name, freeRetries, minWait) {
  const bruteforce = createOrUseBruteForce(name, freeRetries, minWait);

  return function (req, res, next) {
    bruteforce.prevent(req, res, next, (err, data) => {
      if (err) {
        const waitTime = Math.ceil(data.nextValidRequest.getTime() / 1000 / 60);
        return res.status(429).send(
          `Too many requests for the ${name} namespace. Please retry in ${waitTime} minutes`
        );
      }
      next();
    });
  };
}

async function promisifyBruteForce(name, freeRetries, minWait, req, res) {
  return new Promise((resolve, reject) => {
    bruteforce(name, freeRetries, minWait)(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function isValidCode(code) {
  if (code > 400 && code < 503) {
    return code;
  }

  return 500
}

const app = express();

app.use(bruteforce('global', 100, 5));

const router = express.Router();

router.get('/v1/users', bruteforce('users', 50, 1), function (req, res) {

  res.send({ message: "send resource"})
});

router.get('/v1/apps', async function (req, res) {
  try {
    await promisifyBruteForce('apps', 30, 2, req, res)
    res.status(200).send({ message: "Source "})
  } catch (err) {
    res.status(isValidCode(err.code)).send(err.message);
  }
});

app.use('/api', router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
