const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");

router.get("/directory", communityController.getCommunityDirectory);
router.get("/profile/:slug", communityController.getProfileBySlug);

module.exports = router;
