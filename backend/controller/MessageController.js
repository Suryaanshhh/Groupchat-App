const User = require("../models/user");
const Messages = require("../models/message");
const Group = require("../models/Group");
const { response } = require("express");
const sq = require("sequelize");

exports.AddMessage = async (req, res, next) => {
  try {
    const Message = req.body.Message;
    const Id = req.user.id;
    const Gid = await Group.findAll({
      where: {
        UserId: Id,
      },
    });
    console.log(Gid);
    const GroupID = Gid[0].dataValues.id;
    console.log(GroupID);

    const response = await Messages.create({
      content: Message,
      UserId: Id,
      GroupId: GroupID,
    });
    res.status(201).json({ response, message: "Sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.GetMessage = async (req, res, next) => {
  const Id = req.user.id;
  console.log(Id);
  let messageId = req.query.messageId;
  if (messageId === undefined) {
    messageId = -1;
  }

  const GroupID = req.query.group||1;
  console.log(`GiD--------is ${GroupID}`);
  await Messages.findAll({
    where: {
      UserId: Id,

      id: {
        [sq.Op.gt]: messageId,
      },
      GroupId: GroupID,
    },
    include: [
      {
        model: User,
        attributes: ["name"],
      },
      {
        model: Group,
        attributes: ["name","id"],
      },
    ],
  })
    .then((messages) => {
      res.status(200).json({ messages });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "something went wrong" });
    });
};
