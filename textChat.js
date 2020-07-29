const { findNextId } = require("./server/utiles").shortSequentialId()
var db = require('ep_etherpad-lite/node/db/DB');
// save the chat entry in the database
// db.set("pad:" + this.id + ":chat:" + this.chatHead, { "text": text, "userId": userId, "time": time });

// textChat:padId:headingId:textId

const saveTextChatMessage = (padId, headingId, message) => {
	const dbKey = "textChat:" + padId + ":" + headingId
	const dbValue = {text: message.text, userId: message.userId, time: message.time}
	db.set(dbKey, dbValue)
}

const getTextChat = (padId, headingId) => {
	const dbKey = "textChat:" + padId + ":" + headingId
	
}

exports.socketSendText = async function () {
	try {
		await db.set("textChat", {name: "hga"})
		const data = await db.get("textChat")
		console.log(data)
		return data
	} catch (error) {
		console.log(error)
	}

	// return data
	// io.emit('updateTextChat', socket.username, data)
}

