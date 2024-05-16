const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Members = require("../models/Members");
const Group = require("../models/Group");

function generateAccessToken(id, premium) {
  return jwt.sign({ userId: id, premium }, "magical-key");
}

exports.register = async (req, res, next) => {
  const name = req.body.name;
  const mail = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;

  const AlreadyExists = await User.findOne({ where: { email: mail } });
  if (AlreadyExists) {
    console.log("user Exists");
    res.status(500).json({ message: "User Already Exists" });
  } else {
    await bcrypt.hash(password, 10, async (err, hash) => {
      console.log(err);
      await User.create({
        name: name,
        email: mail,
        password: hash,
        number: phone,
      });
      res.status(200).json({ message: "User SignedUp Successfully" });
    });
  }
};

exports.Login = async (req, res, next) => {
  const email = req.params.email;
  const password = req.body.password;
  // console.log(`firts pass is ${password}`);

  await User.findAll({ where: { email: email } })
    .then((user) => {
      if (user.length > 0) {
         Members.findOne({ where: { name: user[0].name } }).then(
          (members) => {
            console.log(`members-=--------${members}`)
            bcrypt.compare(password, user[0].password, (err, result) => {
              if (err) {
                res
                  .status(500)
                  .json({ success: false, message: "Something went wrong" });
              }
              if (result == true) {
                //console.log(`second pass is ${user[0].password}`);
                res.status(201).json({
                  message: "Login Successfull",
                  token: generateAccessToken(user[0].id),
                });
              } else {
                res.status(401).json({ message: "Incorrect Password" });
              }
            });
          }
        );
      } else {
        res.status(404).json({ message: "user not found" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.InviteUse = async (req, res, next) => {
  try {
    const name = req.body.name;
    const mail = req.body.email;
    const phone = req.body.phone;

    const UserExist = await User.findOne({
      where: {
        name: name,
        email: mail,
        number: phone,
      },
    });
    const Gid = await Group.findOne({
      where: {
        admin: req.user.name,
      },
      attributes: ["id"],
    });
    console.log(Gid);
    if (UserExist) {
      await Members.create({
        name: name,
        GroupId: Gid.id,
      })
        .then((response) => {
          res
            .status(201)
            .json({ response, message: "member added to the group" });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
