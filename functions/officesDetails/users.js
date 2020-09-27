const { db, admin } = require("../util/admin");

const firebaseConfig = require("../util/firebaseConfig");

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const {
  validateSignupData,
  validateLoginData,
} = require("../util/usersValidators");
const { config } = require("firebase-functions");

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handler: req.body.handler,
  };

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  const officeDefaultColor = 'offceDefaultColor.jpg';

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
        colorUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${officeDefaultColor}?alt=media`, //To be removed since this functionality is only needed on officeName not on userHandler
        userId
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
        return res.status(500).json({general: 'Something went wrong, please try again'}); //Server error
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status.json(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      // auth/wrong-password,
      //auth/user-does not exist
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credential, please try again" });
      } else return res.status(500).json({ errors: err.code });
    });
};

exports.uploadOfficeColor = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let colorFileName;
  let colorToBeUploaded = {};

  const busboy = new BusBoy({ headers: req.headers });

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if(mimetype !== "image/jpeg" && mimetype !== 'image/png' && mimetype !== 'image/jpg'){
      return res.status(400).json({ error: "Wrong file type submitted"})
    }
    //my.image.png
    const colorExtension = filename.split(".")[filename.split(".").length - 1]; //Get the index of the last item and the value of it.
    ///92384982394823948.png
    colorFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${colorExtension}`;
    const filepath = path.join(os.tmpdir(), colorFileName);
    colorToBeUploaded = { filepath, mimetype };

    //Use filestyle to create the file
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(colorToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: colorToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const colorUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${colorFileName}?alt=media`; //prevent colorImg to be downloaded into a computer
        return db.doc(`/offices/${req.user.handler}`).update({ colorUrl }); // <= change from req.user.handler to req.body.officeName later so that colorUploaded don't get assined to userHandler instated of officeName*/
      })
      .then(() => {
        return res.json({ message: "Color uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody) //This is basically a property that is in every req.
};
