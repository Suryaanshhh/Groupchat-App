const Messages=require('../models/message');
const ArchivedChats=require('../models/ArchiveChats')
const cron=require('node-cron');

async function archiveOldMessages() {
    try {
        // Get messages older than 1 day
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oldMessages = await Messages.findAll({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo,
                },
            },
        });

        // Copy old messages to ArchivedChats
        const archivedMessages = oldMessages.map(msg => ({
            content: msg.content,
            fileUrl: msg.fileUrl,
            UserId: msg.UserId,
            GroupId: msg.GroupId,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }));
        await ArchivedChats.bulkCreate(archivedMessages);

        // Delete old messages from Messages
        await Messages.destroy({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo,
                },
            },
        });

        console.log('Archived and deleted old messages successfully');
    } catch (error) {
        console.error('Error archiving messages:', error);
    }
}


function startCronJob() {
  
    cron.schedule('0 0 * * *', async () => {
        console.log('Running the archiveOldMessages job at midnight');
        await archiveOldMessages();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    });
}

module.exports = startCronJob;
