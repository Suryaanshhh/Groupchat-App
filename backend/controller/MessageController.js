const User = require("../models/user");
const Messages = require("../models/message");
const { response } = require("express");
const sq = require("sequelize");
exports.AddMessage = (req, res, next) => {
  const Message = req.body.Message;
  const Id = req.user.id;
  Messages.create({
    content: Message,
    UserId: Id,
  }).then((response) => {
    res.status(201).json({ response, message: "Sent successfully" });
  });
};

exports.GetMessage = (req, res, next) => {
  let messageId = req.query.messageId;
  if (messageId === undefined) {
    messageId = -1;
  }
  console.log(messageId);
  Messages.findAll({
    where: {
      UserId: req.user.id,

      id: {
        [sq.Op.gt]: messageId,
      },
    },
    include: [
      {
        model: User,
        attributes: ["name"],
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
