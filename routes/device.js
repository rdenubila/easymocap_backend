var express = require("express");
const Device = require("../controllers/DeviceController");

var router = express.Router();

router.get("/", Device.List);
router.get("/:id", Device.Detail);
router.post("/", Device.Store);
router.put("/:id", Device.Update);
router.delete("/:id", Device.Delete);

module.exports = router;