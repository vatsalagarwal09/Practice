const Joi = require("@hapi/joi");

const schema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

const val = schema.validate({ email: "abc@yah.com", password: "harry123" });

if (val.error) {
  console.log(val.error.details);
} else {
  console.log("validation done");
}
// console.log(schema.validate({ email: 'abc', password: 'harry123' }).error)

// console.log(schema.validate({email: 'abc@yah.com', password: 'harry123'}).error)

module.exports = schema;
