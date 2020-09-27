const functions = require("firebase-functions");
const app = require("express")();
const FBAuth  = require('./util/fbAuthHelperMethods'); //Used for protected path

const { getAllOffices, createSingleOffice, officeView, addStaffMember, deleteOffice } = require('./officesDetails/offices');

const { signup, login, uploadOfficeColor } = require('./officesDetails/users');

//offices route
app.get("/offices", getAllOffices);
app.post("/office", createSingleOffice);
app.get("/office/:officeId", officeView);
app.delete('/office/:officeId', deleteOffice)

//user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/office/color", FBAuth, uploadOfficeColor);
app.post('/office/:officeId/staff', addStaffMember)

//https://baseurl.com/api/**
exports.api = functions.https.onRequest(app);
