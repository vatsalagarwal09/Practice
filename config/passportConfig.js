const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../config/database/postgresqlConfig");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    console.log(email + " " + password);
    console.log("reached student");
    try {
      db.query(
        "SELECT * FROM student WHERE email = $1",
        [email],
        (err, student) => {
          student = student.rows[0] || null;

          if (student == null) {
            console.log(student);
            return done(null, false, { message: "No student with that email" });
          }

          console.log(
            "After fetching " + student.email + " " + student.password
          );
          console.log("In authentication student " + student);

          try {
            //     if (bcrypt.compare(password, student.password)) {
            if (password.localeCompare(student.password) == 0) {
              console.log("Authenticated");
              return done(null, student);
            } else {
              console.log("NotAuthenticated");
              return done(null, false, { message: "Password incorrect" });
            }
          } catch (e) {
            return done(e);
          }
        }
      );
    } catch (error) {
      console.log("Error occured during authentication");
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  passport.serializeUser((student, done) => {
    console.log("in serialsize student");
    console.log("In serialize studentid " + student);
    done(null, student.id);
  });

  passport.deserializeUser((id, done) => {
    try {
      db.query("SELECT * FROM student WHERE id = $1", [id], (err, student) => {
        console.log("In deserialize email " + student.rows[0].id);
        return done(null, student.rows[0].id);
      });
    } catch (error) {
      console.log("Error occured during authentication in deserialize");
    }
  });
}

module.exports = initialize;
