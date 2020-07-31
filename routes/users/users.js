const express = require("../../node_modules/express");
const bodyParser = require("../../node_modules/body-parser");
const router = express.Router();
const bcrypt = require("../../node_modules/bcrypt");
const schema = require("../../config/validation");
const db = require("../../config/database/postgresqlConfig");
const passport = require("../../node_modules/passport");
const session = require("../../node_modules/express-session");
const methodOverride = require("../../node_modules/method-override");
require("../../node_modules/dotenv").config();

// ------------------------------------------------------------------------
// payment related part

const {
  initPayment,
  responsePayment,
} = require("./paytm-integration/paytm/services/index");

// ------------------------------------------------------------------------

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
  res.send("User homepage");
});

// router.get("/homepage", checkAuthenticated, (req, res) => {
//   res.send("User homepage after login");
// });

router.get("/login", (req, res) => {
  res.send("This is login page!!");
  //checked
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    failureRedirect: "/users/login",
  }),
  function (req, res) {
    res.redirect("/users/mydetails/" + req.body.password);
  }
  //checked
);

router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/users/login");
  //checked
});

router.get("/mydetails/:rollNumber", checkAuthenticated, async (req, res) => {
  try {
    let roll = { _id: req.params.rollNumber };
    const roll1 = roll._id;
    const displayStudent = await db.query(
      "SELECT P.payment_id, P.student_id, P.course_id, P.year, P.tution_fees, P.transport_fees, P.hostel_fees, P.discount, P.fine_id, P.due_date, P.haspaid, P.total_fees FROM payment_data as P JOIN student as S ON P.student_id = S.id AND S.password=$1",
      [roll1]
    );

    res.json(displayStudent.rows);
    console.log(displayStudent.rows.json);
  } catch (err) {
    console.log(err.message);
  }
});

// ----------------------------------------------------------------------------------------
// Paytm payment part starts here

router.use(express.static(__dirname + "/views"));
//router.set("view engine", "ejs");

// paytm payment page
router.get("/paywithpaytm", checkAuthenticated, async (req, res) => {
  initPayment(req.query.amount).then(
    (success) => {
      res.render("paytmRedirect.ejs", {
        resultData: success,
        paytmFinalUrl: process.env.PAYTM_FINAL_URL,
      });
    },
    (error) => {
      res.send(error);
    }
  );
});
// paytm successful payment
router.post("/paywithpaytmresponse/:rollno", checkAuthenticated, (req, res) => {
  let roll = { _id: req.params.rollno };
  responsePayment(req.body).then(
    (success) => {
      res.render("response.ejs", { resultData: "true", responseData: success });
      // only if succesful update my receipt table
      if (req.body.STATUS == "TXN_SUCCESS") {
        let receipt_no = req.body.ORDERID;
        let paymentdate = req.body.TXNDATE;
        let paymentamount = req.body.TXNAMOUNT;
        /*console.log(roll);
                console.log(receipt_no);
                console.log(paymentdate);
                console.log(paymentamount);
                console.log(typeof(roll));*/
        const allpaymentdata = pool.query(
          "UPDATE receipt SET receipt_no=$1,payment_date=$2,payment_amount=$3 WHERE student_id=$4",
          [receipt_no, paymentdate, paymentamount, roll._id]
        );
      }
    },
    (error) => {
      res.send(error);
    }
  );
});

// Paytm payment part ends here
// ----------------------------------------------------------------------------------------------------------

function checkAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  console.log("reached checkAuthenticated");
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

function checkNotAuthenticated(req, res, next) {
  let password = req.body.password;
  console.log(req.isAuthenticated());
  console.log("reached checkNotAuthenticated");
  if (req.isAuthenticated()) {
    return res.redirect("/users/mydetails/" + password + "/");
  }
  next();
}

module.exports = router;
