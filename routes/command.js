var express = require("express");
const Command = require("../controllers/CommandController");

var router = express.Router();

router.get("/", Command.List);
router.get("/:id", Command.Detail);
router.post("/:id/run", Command.Run);
router.delete("/:id", Command.Delete);

module.exports = router;