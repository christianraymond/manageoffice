const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.getOffices = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("offices")
    .get()
    .then((data) => {
      let offices = [];
      data.forEach((docItem) => {
        offices.push(docItem.data());
      });

      return res.json(offices);
    })
    .catch((err) => console.error(err));
});

//Create office through POST request
exports.createOffice = functions.https.onRequest((req, res) => {
  //prevent sending request to method that is not meant to be POST req.
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
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
