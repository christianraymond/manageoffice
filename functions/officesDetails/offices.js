const { db } = require("../util/admin");
const firebaseConfig = require("../util/firebaseConfig");

//Get all func
exports.getAllOffices = (req, res) => {
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
};

//Create office through POST request
exports.createSingleOffice = (req, res) => {
  if (req.body.officeName.trim() == "") {
    return res
      .status(400)
      .json({ officeName: "Office name must not be empty" });
  }

  const officeDefaultColor = "offceDefaultColor.jpg";

  const newOffice = {
    officeName: req.user.handler, // <= OfficeName will automatically take the name of sined in user as a hanlder name otherwise use the => /* officeName: req.body.officeName,*/
    officeLocation: req.body.officeLocation,
    officeEmail: req.body.officeEmail,
    officeTellNumber: req.body.officeTellNumber,
    officeMaxOcupant: req.body.officeMaxOcupant,
    officeColor: req.body.officeColor,
    colorUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${officeDefaultColor}?alt=media`,
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
};

///Create staffs func
exports.officeView = (req, res) => {
  let officeData = {};
  db.doc(`/offices/${req.params.officeId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "Office not found" }); //In case someone tryies to access an office does not exit anymore.
      }
      officeData = doc.data();
      officeData.officeId = doc.id;
      return db
        .collection("staffs")
        .where("officeId", "==", req.params.officeId)
        .get(); //Query to staffs-names that links to the same officeId.
    })
    .then((data) => {
      officeData.staffs = [];
      data.forEach((doc) => {
        officeData.staffs.push(doc.data()); //Here you need to pass the staffId
      });
      return res.json(officeData);
    })
    .catch((err) => { 
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
