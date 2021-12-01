var express = require("express");
const Animation = require("../controllers/AnimationController");

var router = express.Router();

router.get("/", Animation.List);
router.get("/:id", Animation.Detail);
router.post("/", Animation.Store);
router.put("/:id", Animation.Update);
router.delete("/:id", Animation.Delete);

module.exports = router;