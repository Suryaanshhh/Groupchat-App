const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const User = require("./backend/models/user");
const Messages = require("./backend/models/message");
const Group = require("./backend/models/Group");
const Member = require("./backend/models/Members");
const Admin = require("./backend/models/Admin");
const ArchivedChats=require('./backend/models/ArchiveChats');
const sq = require("./backend/util/database");
const UserRoutes = require("./backend/routes/UserRoute");
const MessageRoute = require("./backend/routes/MessageRoute");
const GroupRouts = require("./backend/routes/GroupRoute");
const Cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const startCronJob=require('./backend/controller/Archive');
const { CronJob } = require("cron");
app.use(bodyParser.json({ extended: false }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(Cors());

app.use(express.static(path.join(__dirname, "js")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Routes
app.use(UserRoutes);
app.use(MessageRoute);
app.use(GroupRouts);

app.use((req, res) => {
  console.log(`url is ${req.url}`);
  res.sendFile(path.join(__dirname, `frontend${req.url}`));
});

// Db Schema
User.hasMany(Messages);
Messages.belongsTo(User);
User.hasMany(Group);
Group.belongsTo(User);
Group.hasMany(Messages);
Messages.belongsTo(Group);
Group.hasMany(Member);
Member.belongsTo(Group);
Group.hasMany(Admin);
Admin.belongsTo(Group);
ArchivedChats.belongsTo(User);
ArchivedChats.belongsTo(Group);

sq.sync();

startCronJob()


server.listen(4000 || process.env.PORT, () => {
  console.log('Server is running on port 4000');
});

