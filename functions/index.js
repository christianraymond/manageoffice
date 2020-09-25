const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyChgBZJcosknPE9RoQZKjmWVzTgdD0o3zI",
  authDomain: "manageofficeproj-23044.firebaseapp.com",
  databaseURL: "https://manageofficeproj-23044.firebaseio.com",
  projectId: "manageofficeproj-23044",
  storageBucket: "manageofficeproj-23044.appspot.com",
  messagingSenderId: "478785903635",
  appId: "1:478785903635:web:bf648388ac88f0f899b3e6",
  measurementId: "G-8T4EEG271L",
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/offices", (req, res) => {
  db.collection("offices")
    .orderBy("officeName", "desc") //Get latest office show first
    .get()
    .then((data) => {
      let offices = [];
      data.forEach((doc) => {
        offices.push({
          //Show offices ID aswell in postman
          officeId: doc.id,
          officeName: doc.data().officeName,
          officeLocation: doc.data().officeLocation,
          officeEmail: doc.data().officeEmail,
          officeTellNumber: doc.data().officeTellNumber,
          officeMaxOcupant: doc.data().officeMaxOcupant,
          officeColor: doc.data().officeColor,
        });
      });
      return res.json(offices);
    })
    .catch((err) => console.error(err));
});

//Create office through POST request
app.post("/office", (req, res) => {
  const newOffice = {
    officeName: req.body.officeName,
    officeLocation: req.body.officeLocation,
    officeEmail: req.body.officeEmail,
    officeTellNumber: req.body.officeTellNumber,
    officeMaxOcupant: req.body.officeMaxOcupant,
    officeColor: req.body.officeColor,
  };
  db.collection("offices")
    .add(newOffice)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
});

//Helper method checking for valid email.

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};
//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handler: req.body.handler,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Paasword must match";
  if (isEmpty(newUser.handler)) errors.handler = "Must not be empty";

  //Check if the error object is empty
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  //TODO validate data
  let token, userId;
  db.doc(`/users/${newUser.handler}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handler: "this handler already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handler: newUser.handler,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handler}`).set(userCredentials);
    })
    //Finally signup user and pass them access id token.
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email already in use" }); //Client error
      } else {
        return res.status(500).json({ error: err.code }); //Server error
      }
    });
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must not be empty";
  if (isEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({token});
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
});

//https://baseurl.com/api/**
exports.api = functions.https.onRequest(app);
