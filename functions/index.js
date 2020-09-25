const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const express = require("express");
const app = express();

app.get("/offices", (req, res) => {
  admin
    .firestore()
    .collection("offices")
    .orderBy('officeName', 'asc') //Get latest office show first
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

  admin
    .firestore()
    .collection("offices")
    .add(newOffice)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
});

//https://baseurl.com/api/**

exports.api = functions.https.onRequest(app);
