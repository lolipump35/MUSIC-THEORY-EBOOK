const bcrypt = require("bcryptjs");

async function test() {
  const password = "Diabolo091102";
  const hash = "$2b$10$Ly6FhK/tcxqyDUg75qRfXeZ4WJlpLB1dyCnL1r5Ckhw0pNfFYBmMi";
  
  const match = await bcrypt.compare(password, hash);
  console.log("Résultat compare() :", match);
}

test();
