const { Sequelize } = require("sequelize");

const sq=require("../util/database");

const ArchivedChats = sq.define('ArchivedChats', {
    content: Sequelize.STRING,
    fileUrl: Sequelize.STRING,
    UserId: Sequelize.INTEGER,
    GroupId: Sequelize.INTEGER,
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
});

module.exports=ArchivedChats