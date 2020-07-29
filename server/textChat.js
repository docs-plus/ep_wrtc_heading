const { findNextId } = require("./utiles").shortSequentialId()
const { objectHasPath } = require("./utiles")
const db = require("./dbRepository")
const { TEXT_CHAT_KEY, TEXT_CHAT_LIMIT } = require("../config")
const latestTextChatId = {}

console.log(TEXT_CHAT_LIMIT,":222222222222222222")

exports.getMessages = async (padId, headId, {limit = TEXT_CHAT_LIMIT, offset = 0} = {limit , offset}) => {
	const dbKey = TEXT_CHAT_KEY + padId + ":" + headId
	
	const lastMessageId = await db.getLatestId(dbKey+":*")

	return db.getLastMessages(dbKey, lastMessageId, {limit, offset})
}

// WRTC:TEXT:padId:headingId:textId
exports.save = async function (padId, headId, message) {
	let messageKey = TEXT_CHAT_KEY + padId + ":" + headId 
	
	const existMessageId = ((((latestTextChatId || {})[padId]) || {})[headId]) 

	if(!existMessageId){
		let lastMessageId = await db.getLatestId(messageKey+":*")
		lastMessageId = lastMessageId ? lastMessageId : 1

		if(!latestTextChatId[padId])
			latestTextChatId[padId] = {}

		latestTextChatId[padId][headId] = lastMessageId 
	} else {
		latestTextChatId[padId][headId] = latestTextChatId[padId][headId] + 1
	}
	
	const newMessageId = latestTextChatId[padId][headId]
	messageKey = messageKey + ":" + newMessageId
	
	await db.set(messageKey, message)
	
	return newMessageId
}
