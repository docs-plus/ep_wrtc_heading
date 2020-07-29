
const {VIDEO_CHAT_LIMIT} = require("../config")

// data Structure
// "padId:headingId": [{object}]
const rooms = {}

const socketUserJoin = (data) => {
	const padId = data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}`
	let canUserJoin = false

	// if the room does not exist create the room for the first time.
	if(!rooms[roomKey])
		rooms[roomKey] = []
	
	// does user already joined the room?
	var isUserInRoom = rooms[roomKey].find(x => x.userId === data.userId)
	if (isUserInRoom) return false;

	var roomInfo = {
		present: rooms[roomKey].length,
		list: rooms[roomKey]
	};

	if(roomInfo.present < VIDEO_CHAT_LIMIT){
		canUserJoin = true
		rooms[roomKey].push(data);
		roomInfo.present++
	} else {
		canUserJoin = false
	}

	return {
		canUserJoin,
		roomInfo,
		data
	}
}

const socketUserLeave = (data, callback) => {
	const padId = data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}`
	const result = {
		data: null,
		roomInfo: null
	}

	if(!rooms[roomKey]) return result;
	
	// remove user in that room
	rooms[roomKey] = rooms[roomKey].filter(x => !(x.userId === data.userId))

	// if there is not anymore user in that room, delete room
	if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];

	var roomInfo = {
		present: rooms[roomKey] ? rooms[roomKey].length : 0,
		list: rooms[roomKey] || []
	};

	result.data = data
	result.roomInfo = roomInfo

	return result
}

const socketBulkUpdateRooms = (padId, hTagList) => {
	const result = {
		roomCollection: null,
		roomInfo: null
	}
	
	// remove the room that not available and excrete user from room
	// hTagList: [ headingTagId ]
	// remove a pad:headingId, if there is not anymore user in that room 
	hTagList.forEach(el => {
		const roomKey = `${padId}:${el.headingId}`
		if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];
	})
	
	const roomKeys = Object.keys(rooms).filter(x=> x.includes(padId))

	if(!roomKeys) return result;
	
	var roomCollection = {}

	roomKeys.forEach(roomKey => {
		if(!roomCollection[roomKey])
			roomCollection[roomKey] = rooms[roomKey]
	})
	
	var roomInfo = {
		present:  0,
		list:  []
	};
	
	result.roomCollection =  roomCollection
	result.roomInfo = roomInfo

	return result
}

const socketDisconnect = (data) => {
	const padId =    data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}` 
	const result = {
		data:  null,
		roomInfo: null,
		padId
	}

	if(!rooms[roomKey]) return result;


	// remove user in that room
	rooms[roomKey] = rooms[roomKey].filter(x => !(x.userId === data.userId))

	// if there is not anymore user in that room, delete room
	if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];

	var roomInfo = {
		present: rooms[roomKey] ? rooms[roomKey].length : 0,
		list: rooms[roomKey] || []
	};

	result.data = data
	result.roomInfo = roomInfo

	return result
}

module.exports = {
	socketUserJoin, 
	socketBulkUpdateRooms,
	socketUserLeave,
	socketDisconnect,

}