const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const accountSid = "AC37254c7677a8ad141f521e9da2800c40";
const authToken = "c65cab7423d53198c029e6ff07b9fecc";
const client = require("twilio")(accountSid, authToken);

const app = express();
const port = 5000;

// Where we will keep books
let books = [];

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/sendMessage", (req, res) => {
  // We will be coding here
  console.log("API HIT");
  console.log(req.body);
  
  let phNo = req.body.phNo;
  let finalPhoneNo = "whatsapp:+91" + phNo;
  let bodyMsg = "There is a " + req.body.message + "for " + req.body.clientID + " with recent average temp of " + req.body.temperature.toString();
  client.messages
    .create({
      body: bodyMsg,
      from: "whatsapp:+14155238886",
      to: finalPhoneNo,
    })
    .then((message) => console.log(message.sid))
    .done();

  console.log("Twilio hit");

  // return "Awesome"
  res.send("Twilio hit");
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
