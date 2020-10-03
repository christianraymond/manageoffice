const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());
const FBAuth = require("./util/fbAuthHelperMethods"); //Used for protected path

const {
  getAllOffices,
  createSingleOffice,
  officeView,
  addStaffMember,
  deleteOffice,
} = require("./officesDetails/offices");

const { signup, login, uploadOfficeColor } = require("./officesDetails/users");
const { db } = require("./util/admin");

//offices route
app.get("/offices", getAllOffices);
app.post("/office", createSingleOffice);
app.get("/office/:officeId", officeView);
app.delete("/office/:officeId", deleteOffice);

//user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/office/color", FBAuth, uploadOfficeColor);
app.post("/office/:officeId/staff", addStaffMember);

//https://baseurl.com/api/**
exports.api = functions.https.onRequest(app);

//Make sure staffMembers attached to an office get also deleted when an office is deleted
//DB TRIGGER
exports.onOfficeDelete = functions //functions[onOfficeDelete]: function ignored because the firestore emulator does not exist or is not running. Fix this later
  .region("europe-west1")
  .firestore.document("/offices/{officeId}")
  .onDelete((snapshot, context) => {
    const officeId = context.params.officeId;
    const batch = db.batch();

    return db
      .collection("staffs")
      .where("officeId", "==", officeId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/staffs/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
