const User = require("../models/user");
const Messages = require("../models/message");
const Groups = require("../models/Group");
const Members = require("../models/Members");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const { response } = require("express");
const { where } = require("sequelize");

function generateAccessToken(id, admin) {
  return jwt.sign({ userId: id, admin }, "magical-key");
}

exports.CreateGroup = async (req, res, next) => {
  try {
    const GroupName = req.body.name;
    const Uid = req.user.id;
    const group = await Groups.create({
      name: GroupName,
      UserId: Uid,
    });
    await Members.create({
      name: req.user.name,
      GroupId: req.user.id,
      IsAdmin: true,
    });
    await Admin.create({
      name: req.user.name,
      GroupId: req.user.id,
    });
    await User.update({ IsAdmin: true }, { where: { id: Uid } });
    res.status(201).json({
      group,
      success: true,
      message: "Transaction completed",
      token: generateAccessToken(Uid, true),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getGroupList = (req, res, next) => {
  Groups.findAll({
    where: {
      UserId: req.user.id,
    },
    attributes: ["name", "id"],
  })
    .then((name) => {
      res.status(200).json({ name });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.ShowMembers = async (req, res, next) => {
  const gid = await Admin.findOne({ where: { name: req.user.name } });
  console.log(gid);
  if (gid.id) {
    const peopeles = await Members.findAll({
      where: { GroupId: gid.id, IsAdmin: null },
    });
    console.log(peopeles);
    res.status(200).json({ peopeles });
  }
};

exports.RemoveUser = async (req, res, next) => {
  const Mid = req.params.id;
  console.log(`members id are ------------------${Mid}`);
  await Members.destroy({ where: { id: Mid } });
  res.status(200).json({ message: "user removed from the group" });
};

exports.MakeAdmin = async (req, res, next) => {
  const Mid = req.params.id;
  await Members.update({ IsAdmin: true }, { where: { id: Mid } });
  await User.update({ IsAdmin: true }, { where: { id: Mid } });

  const gid = await Members.findOne({
    where: { id: Mid },
    attributes: ["GroupId"],
  });

  await Admin.create({
    name: req.params.name,
    GroupId: gid.GroupId,
  });

  res.status(201).json({ message: "Admin made successfully" });
};
