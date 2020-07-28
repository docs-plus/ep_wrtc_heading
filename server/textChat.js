var db = require('ep_etherpad-lite/node/db/DB').db;

// save the chat entry in the database
db.set("pad:" + this.id + ":chat:" + this.chatHead, { "text": text, "userId": userId, "time": time });

// textChat:padId:headingId

const saveTextChatMessage = (padId, headingId, message) => {
	const dbKey = "textChat:" + padId + ":" + headingId
	const dbValue = {text: message.text, userId: message.userId, time: message.time}
	db.set(dbKey, dbValue)
}

const getTextChat = (padId, headingId) => {
	const dbKey = "textChat:" + padId + ":" + headingId
	
}

const socketSendText = (data, padId, callback) => {
	io.emit('updateTextChat', socket.username, data)
}

module.exports = {
	socketSendText,
	
}