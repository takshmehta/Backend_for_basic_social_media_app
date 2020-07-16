const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
mongoose.set("useFindAndModify", false);

// Person model
const Person = require("../../models/Person");

// Profile model
const Profile = require("../../models/Profile");

//@type    GET
//@route   /api/profile/
//@desc    for personal profile
//@access  PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res
            .status(404)
            .json({ profileError: "PRofile does not exist." });
        }
        res.json(profile);
      })
      .catch((err) => console.log("Some erro " + err));
  }
);
//@type    POST
//@route   /api/profile/
//@desc    for updating/save personal profile
//@access  PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    // Updating or saving in database
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then((profile) => res.json(profile))
            .catch((err) => console.log("error here" + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              //username already exists
              if (profile) {
                res.status(400).json({ username: "Username already exists" });
              }
              //saving
              new Profile(profileValues)
                .save()
                .then((profile) => {
                  res.json(profile);
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log("Error " + err));
  }
);

//@type    GET
//@route   /api/profile/:username
//@desc    for getting user profile based on USERNAME
//@access  PUBLIC
router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ userError: "User not found !" });
      }
      return res.json(profile);
    })
    .catch((err) => console.log("Error in fetching username" + err));
});

//@type    GET
//@route   /api/profile/find/everyone
//@desc    for getting profile of all users
//@access  PUBLIC
router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ userError: "None found" });
      }
      return res.json(profiles);
    })
    .catch((err) => console.log("Error in fetching username" + err));
});

//@type    DELETE
//@route   /api/profile/
//@desc    for deleting profile of a users
//@access  PRIVATE

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(res.json({ deletion: "Deletion success." }))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type    GET
//@route   /api/profile/workrole
//@desc    for populating workrole into profile user
//@access  PUBLIC

router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          req.json({ error: "user doesn't exist" });
        }
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then(res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type    DELETE
//@route   /api/profile/workrole?:workrole_id
//@desc    for deleting workrole of a user
//@access  PRIVATE
router.delete(
  "/workrole/:workrole_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          res.json({ err: "no profile with the given id found" });
        }
        const removethis = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.workrole_id);
        profile.workrole.splice(removethis, 1);

        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
