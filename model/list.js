const path = require("path");
const fs = require("fs");

let listPath = path.join(__dirname, "../data/list.json");
exports.getListsFromFile = (callback) => {
  fs.readFile(listPath, "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
    try {
      let lists;
      if (!jsonString) {
        lists = "";
      } else {
        lists = JSON.parse(jsonString);
      }
      callback(lists);
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });
};