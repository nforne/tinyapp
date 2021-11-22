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

const querry_DB_By_ID = (id, urlDatabase) => { // to retrieve only data of a particular user id
  let outPut = {} 
  const urlDBKeys = Object.keys(urlDatabase);
  for (let i of urlDBKeys) {
    if (urlDatabase[i]['userID'] === id) {
      outPut[i] = urlDatabase[i];
    }
  }
  return flatUrlDB(outPut);
};

//--------------------------------------

const emailCheck = (email, users) => {
  const usersdbIDs = Object.keys(users);
  for (let i of usersdbIDs) {
    if (users[i]['email'] === email) {
      return true;
    } 
  }
  return false;
};

//--------------------------------------

const fetchEmailById = (id, users) => {
  const usersdbIDs = Object.keys(users);
  for (let i of usersdbIDs) {
    if (users[i]['id'] === id) {
      return users[i]['email'];
    }
  }
}
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

module.exports = {flatUrlDB, generateRandomString, emailCheck, fetchEmailById, querry_DB_By_ID};
