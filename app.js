const Express=require("express");
const app=Express();
const User=require('./backend/models/user');
const Messages=require('./backend/models/message');
const sq=require('./backend/util/database');
const UserRoutes=require('./backend/routes/UserRoute');
const MessageRoute=require('./backend/routes/MessageRoute');
const Cors=require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.json({ extended: false }));
app.use(Cors({
    origin:"*"
}))
app.use(UserRoutes);
app.use(MessageRoute);

User.hasMany(Messages);
Messages.belongsTo(User);

sq.sync()

app.listen(4000);