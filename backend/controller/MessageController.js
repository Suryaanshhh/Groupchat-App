const User = require("../models/user");
const Messages = require("../models/message");
const Group = require("../models/Group");
const { response } = require("express");
const sq = require("sequelize");
const Sequelize=require('../util/database');
const { Socket } = require("socket.io");





exports.AddMessage = async (req, res, next) => {
  try {
    const Message = req.body.Message;
    const Id = req.user.id;
    const Gid = req.body.groupId;

    const newMessage = await Messages.create({
      content: Message,
      UserId: Id,
      GroupId: Gid,
    });

    const messageWithUser = await Messages.findOne({
      where: { id:newMessage.id },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Group,
          attributes: ['name', 'id'],
        },
      ],
    });

    // Emit the new message to all connected clients
    req.io.emit('newMessage', messageWithUser);

    res.status(201).json({ response: messageWithUser, message: 'Sent successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



exports.GetMessage = async (req, res, next) => {
  const Id = req.user.id;
  console.log(Id);
  let messageId = req.query.messageId;
  if (messageId === undefined) {
    messageId = -1;
  }
console.log(`mesdawefawfa----${messageId}`)
  const GroupID = req.query.groupId || 1;
  console.log(`GiD--------is ${req.query.groupId}`);
  await Messages.findAll({
    where: {
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
