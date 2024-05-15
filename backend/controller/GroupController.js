const User = require("../models/user");
const Messages = require("../models/message");
const Groups = require("../models/Group");
const { response } = require("express");

exports.CreateGroup = (req, res, next) => {
  const GroupName = req.body.name;
  const Uid = req.user.id;
  Groups.create({
    name: GroupName,
    UserId: Uid,
  })
    .then((response) => {
      res
        .status(201)
        .json({ response, message: "Group createdn successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getGroupList = (req, res, next) => {
  Groups.findAll({
    attributes: ["name","id"],
  })
    .then((name) => {
      res.status(200).json({ name });
    })
    .catch((err) => {
      console.log(err);
    });
};

