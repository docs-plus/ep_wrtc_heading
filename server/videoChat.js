// data Structure
// "padId:headingId": [{object}]
const rooms = {}

const socketUserJoin = (data, callback) => {
	const padId = data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}`

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

	if(roomInfo.present < VIDEOCHATLIMIT){
		rooms[roomKey].push(data);
		roomInfo.present++

		socket.broadcast.to(padId).emit("userJoin", data, roomInfo)

		socket.ndHolder = data
		callback(data, roomInfo)
	} else {
		callback(null, roomInfo)
	}
}

const socketUserLeave = (data, callback) => {
	const padId = data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}` 

	if(!rooms[roomKey]) {
		callback(null, null)
		return true;
	} 

	// remove user in that room
	rooms[roomKey] = rooms[roomKey].filter(x => !(x.userId === data.userId))

	// if there is not anymore user in that room, delete room
	if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];

	var roomInfo = {
		present: rooms[roomKey] ? rooms[roomKey].length : 0,
		list: rooms[roomKey] || []
	};

	socket.broadcast.to(padId).emit("userLeave", data, roomInfo)

	callback(data, roomInfo)
}

const socketBulkUpdateRooms = (padId, hTagList, callback) => {
	// remove the room that not available and excrete user from room
	// hTagList: [ headingTagId ]
	// remove a pad:headingId, if there is not anymore user in that room 
	hTagList.forEach(el => {
		const roomKey = `${padId}:${el.headingId}`
		if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];
	})
	
	const roomKeys = Object.keys(rooms).filter(x=> x.includes(padId))

	if(!roomKeys) return true;
	
	var roomCollection = {}

	roomKeys.forEach(roomKey => {
		if(!roomCollection[roomKey])
			roomCollection[roomKey] = rooms[roomKey]
	})
	
	var roomInfo = {
		present:  0,
		list:  []
	};

	socket.broadcast.to(padId).emit("bulkUpdateRooms", roomCollection, null)

	callback(roomCollection, roomInfo)
}

const socketDisconnect = () => {
	data = socket.ndHolder
	// in the case when pad does not load plugin properly,
	// there is no 'ndHolder'(userData)
	if(!data)
		return false;

	const padId =    data.padId
	const headingId = data.headingId
	const roomKey = `${padId}:${headingId}` 

	if(!rooms[roomKey]) {
		return true;
	} 

	// remove user in that room
	rooms[roomKey] = rooms[roomKey].filter(x => !(x.userId === data.userId))

	// if there is not anymore user in that room, delete room
	if(rooms[roomKey] && rooms[roomKey].length === 0)
		delete rooms[roomKey];

	var roomInfo = {
		present: rooms[roomKey] ? rooms[roomKey].length : 0,
		list: rooms[roomKey] || []
	};

	socket.broadcast.to(padId).emit("userLeave", data, roomInfo)
}

module.exports = {
	socketUserJoin, 
	socketBulkUpdateRooms,
	socketUserLeave,
	socketDisconnect,

}