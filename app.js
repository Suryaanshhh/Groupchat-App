const Express=require("express");
const app=Express();
const User=require('./backend/models/user');
const Messages=require('./backend/models/message');
const Group=require("./backend/models/Group");
const sq=require('./backend/util/database');
const UserRoutes=require('./backend/routes/UserRoute');
const MessageRoute=require('./backend/routes/MessageRoute');
const GroupRouts=require('./backend/routes/GroupRoute');
const Cors=require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.json({ extended: false }));
app.use(Cors())
app.use(UserRoutes);
app.use(MessageRoute);
app.use(GroupRouts)

User.hasMany(Messages);
Messages.belongsTo(User);
User.hasMany(Group);
Group.belongsTo(User);
Group.hasMany(Messages);
Messages.belongsTo(Group)


sq.sync()

app.listen(4000);