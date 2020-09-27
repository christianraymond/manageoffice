const functions = require("firebase-functions");
const app = require("express")();
const FBAuth  = require('./util/fbAuthHelperMethods'); //Used for protected path

const { getAllOffices, createSingleOffice, officeView } = require('./officesDetails/offices');

const { signup, login, uploadOfficeColor } = require('./officesDetails/users');

//offices route
app.get("/offices", getAllOffices);
app.get("/office/:officeId", officeView);
app.post("/office", FBAuth, createSingleOffice);


//user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/office/color", FBAuth, uploadOfficeColor)

//https://baseurl.com/api/**
exports.api = functions.https.onRequest(app);
