const express = require("express");

const listController = require("../controller/list");

const router = express.Router();

router.get("/", listController.getIndex);

router.post("/createList", listController.createLists);

router.post("/activeTask", listController.activeTask);

router.post("/deleteTask", listController.deleteTask);

router.post("/deleteListItem", listController.deleteListItem);

router.post("/editTask", listController.editTask);

router.post("/editList", listController.editList);


module.exports = router;
