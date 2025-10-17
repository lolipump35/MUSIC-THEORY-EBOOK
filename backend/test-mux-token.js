const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("./keys/private_key.pem", "utf8");

const payload = {
  sub: "0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE",
  aud: "mux",
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
};

const token = jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  keyid: "00Va1m65veEkzhbHPW00mQCnMasOjlvZKfPqqNpO1STf4",
});

console.log("✅ Token généré :");
console.log(token);
