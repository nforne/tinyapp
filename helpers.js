//--------------------------------------
const flatUrlDB = (DB) => { // reduce db to a simple k-v pair object
  const urlDBKeys = Object.keys(DB);
  let outPut = {};
  for (let i of urlDBKeys) {
    outPut[i] = DB[i]['longURL'];
  }
  return outPut;
};

//--------------------------------------

function generateRandomString(n) {
  const nums_letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const alphanumeric = nums_letters.split('');
  let key = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * 62);
    key += alphanumeric[index];
  }
  return key;
};

//--------------------------------------


module.exports = {flatUrlDB, generateRandomString};
