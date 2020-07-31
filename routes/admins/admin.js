const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");
const schema = require("../../config/validation");
const db = require("../../config/database/postgresqlConfig");
const pool = require("../../config/database/postgresqlConfig");
const passport = require("passport");
const session = require("express-session");
const methodOverride = require("method-override");
require("dotenv").config();

const initializePassport = require("../../config/passportConfig");
initializePassport(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

router.use(passport.initialize());
router.use(passport.session());
router.use(methodOverride("_method"));

router.get("/", (req, res) => {
  console.log(req.user);
  //checked
  res.send("Admin homepage");
});

// router.get("/homepage", checkAuthenticated, (req, res) => {
//   res.send("Admin homepage after login");
// });

router.get("/login", (req, res) => {
  res.send("This is login page!!");
  //checked
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/admins/features",
    failureRedirect: "/admins/login",
  })
  //checked
);

router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/admins/login");
  //checked
});

router.get("/features", checkAuthenticated, async (req, res) => {
  try {
    res.send("Page containing all functionalities available for admin!");
  } catch (err) {
    console.log(err.message);
  }
});

// get all students payment data
router.get("/student", checkAuthenticated, async (req, res) => {
  try {
    const allStudents = await db.query("SELECT * FROM payment_data");
    res.json(allStudents.rows);
  } catch (err) {
    console.log(err.message);
  }
});

//add by particular student
router.put("/addbyStudent/:rollno", checkAuthenticated, async (req, res) => {
  try {
    let roll = { _id: req.params.rollno };
    console.log(req.body);
    const roll1 = roll._id;
    const hfee = req.body.hostel_fees;
    const tfee = req.body.tution_fees;
    const trfee = req.body.transport_fees;

    const updateStudentPayment = await pool.query(
      "UPDATE payment_data SET tution_fees=$1, transport_fees=$2, hostel_fees=$3 WHERE student_id=$4",
      [tfee, trfee, hfee, roll1]
    );
    const updateTotalFee = await pool.query(
      "UPDATE payment_data SET total_fees=hostel_fees+tution_fees+transport_fees-discount"
    );
    res.json("Updated Successfully");
  } catch (err) {
    console.log(err.message);
  }
});

// // add by year
router.put("/addbyYear/:yearval", checkAuthenticated, async (req, res) => {
  try {
    let year = { _id: req.params.yearval };
    console.log(req.body);
    const year1 = year._id;
    const hfee = req.body.hostel_fees;
    const tfee = req.body.tution_fees;
    const trfee = req.body.transport_fees;

    const updateStudentPayment = await pool.query(
      "UPDATE payment_data SET tution_fees=$1, transport_fees=$2, hostel_fees=$3 WHERE year=$4",
      [tfee, trfee, hfee, year1]
    );
    const updateTotalFee = await pool.query(
      "UPDATE payment_data SET total_fees=hostel_fees+tution_fees+transport_fees-discount"
    );
    res.json("Updated Successfully");
  } catch (err) {
    console.log(err.message);
  }
});

// //query records by rollNumer
router.get(
  "/searchRollNumber/:rollno",
  checkAuthenticated,
  async (req, res) => {
    try {
      let roll = { _id: req.params.rollno };
      console.log(req.body);
      const roll1 = roll._id;

      const displayStudent = await pool.query(
        "SELECT * FROM payment_data WHERE student_id=$1",
        [roll1]
      );

      res.json(displayStudent.rows);
    } catch (err) {
      console.log(err.message);
    }
  }
);

// //query by totalFee
router.get("/searchAmount/:amount", checkAuthenticated, async (req, res) => {
  try {
    let totalFees = { _value: req.params.amount };
    console.log(req.body);
    const totalFees1 = totalFees._value;

    const displayStudents = await pool.query(
      "SELECT * FROM payment_data WHERE total_fees >= $1",
      [totalFees1]
    );
    res.json(displayStudents.rows);
  } catch (err) {
    console.log(err.message);
  }
});

// //delete a record by rollNumer
router.delete("/deleteRollNo/:rollno", checkAuthenticated, async (req, res) => {
  try {
    let roll = { _id: req.params.rollno };
    console.log(req.body);
    const roll1 = roll._id;

    const deleteStudent = await pool.query(
      "DELETE FROM payment_data WHERE student_id = $1",
      [roll1]
    );
    res.json("Deleted record successfully!");
  } catch (err) {
    console.log(err.message);
  }
});

// //delete a record by paymentID
router.delete("/deleteID/:payment_id", checkAuthenticated, async (req, res) => {
  try {
    let paymentID = { _id: req.params.payment_id };
    console.log(req.body);
    const paymentID1 = paymentID._id;

    const deleteStudent = await pool.query(
      "DELETE FROM payment_data WHERE payment_id = $1",
      [paymentID1]
    );
    res.json("Deleted record successfully!");
  } catch (err) {
    console.log(err.message);
  }
});

// //delete records by year/passout students
router.delete("/deleteYear/:year_val", checkAuthenticated, async (req, res) => {
  try {
    let yearVal = { _id: req.params.year_val };
    console.log(req.body);
    const yearVal1 = yearVal._id;

    const deleteStudent = await pool.query(
      "DELETE FROM payment_data WHERE year = $1",
      [yearVal1]
    );
    res.json("Deleted records successfully!");
  } catch (err) {
    console.log(err.message);
  }
});

function checkAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  console.log("reached checkAuthenticated");
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/admins/login");
}

function checkNotAuthenticated(req, res, next) {
  // console.log(req.body);
  console.log(req.isAuthenticated());
  console.log("reached checkNotAuthenticated");
  if (req.isAuthenticated()) {
    return res.redirect("/admins/features");
  }
  next();
}

module.exports = router;
