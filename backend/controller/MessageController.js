const User = require("../models/user");
const Messages = require("../models/message");
const Group = require("../models/Group");
const { response } = require("express");
const sq = require("sequelize");
const Sequelize = require("../util/database");
const { Socket } = require("socket.io");
const AWS = require('aws-sdk');
const multer = require('multer');


// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const bucketName = "chatapp1";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("file");

exports.AddMessage = async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    try {
      const messageContent = req.body.message;
      const userId = req.user.id;
      const groupId = req.body.groupId;
      let fileUrl = null;

      if (req.file) {
        const fileName = Date.now() + "-" + req.file.originalname;
        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL:'public-read'
        };

        try {
          const data = await s3.upload(params).promise();
          fileUrl = data.Location;
        } catch (s3Error) {
          console.error("Error uploading file to S3:", s3Error);
          return res.status(500).json({ message: "File upload to S3 failed" });
        }
      }

      const newMessage = await Messages.create({
        content: messageContent,
        fileUrl: fileUrl,
        UserId: userId,
        GroupId: groupId,
      });

      const messageWithUser = await Messages.findOne({
        where: { id: newMessage.id },
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: Group,
            attributes: ["name", "id"],
          },
        ],
      });

      // Emit the new message to all connected clients
      req.io.emit("newMessage", messageWithUser);

      res
        .status(201)
        .json({ response: messageWithUser, message: "Sent successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
};

exports.GetMessage = async (req, res, next) => {
  const Id = req.user.id;
  console.log(Id);
  let messageId = req.query.messageId;
  if (messageId === undefined) {
    messageId = -1;
  }
  //console.log(`mesdawefawfa----${messageId}`);
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
        attributes: ["name", "id"],
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
