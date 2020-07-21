var eejs = require("ep_etherpad-lite/node/eejs/")
var settings = require("ep_etherpad-lite/node/utils/Settings")
var socketio
var log4js = require("ep_etherpad-lite/node_modules/log4js")
var sessioninfos = require("ep_etherpad-lite/node/handler/PadMessageHandler").sessioninfos
var statsLogger = log4js.getLogger("stats")
var stats = require("ep_etherpad-lite/node/stats")
var packageJson = require('./package.json');
// Make sure any updates to this are reflected in README
var statErrorNames = ["Abort", "Hardware", "NotFound", "NotSupported", "Permission", "SecureConnection", "Unknown"]
var VIDEOCHATLIMIT = 4;


exports.socketio = function (hookName, args, cb) {
	socketio = args.io
	var io = args.io

	// data Structure
	// "padId:headingId": [{object}]
	const rooms = {}

	io.of("/heading_chat_room").on("connect", function (socket) {

		socket.on("join pad", function (padId ,userId, callback) {
			socket.ndHolder = {userId, padId}
			socket.join(padId)
		})

		socket.on("userJoin", function (data, callback) {
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

		})

		// remove the room that not available and excrete user from room
		// hTagList: [ headingTagId ]
		socket.on("bulkUpdateRooms", function (padId, hTagList, callback) {

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
		})

		socket.on("userLeave", function(data, callback){
			
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
		})

		socket.on('disconnect', function(){
		
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
		})


		// socket.on('sync user info', (padId, user) => {
		// 	console.log("padId: ", padId)
		// 	console.log("user: ", user)
		// 	let roomKeys = Object.keys(rooms).find(x=> x.includes(padId))
		// 	console.log("roomKeys: ", roomKeys)

		// 	console.log(!rooms[roomKeys], !roomKeys)
		// 	if(!roomKeys || !rooms[roomKeys]) return true;

		// 	console.log("data: ", rooms[roomKeys])

		// 	rooms[roomKeys] = rooms[roomKeys].forEach((el, index) => {
		// 		if(el.userId === user.userId)
		// 			rooms[roomKeys][index] = {
		// 				padId,
		// 				userId: user.userId,
		// 				userName: user.name,
		// 				headingId: user.headingId
		// 			}
		// 	})
		// })

	})
}

exports.eejsBlock_mySettings = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/settings.ejs")
	return cb();
}

exports.eejsBlock_scripts = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/webrtcComponent.html", {}, module)
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/webrtc.js?v=" + packageJson.version + "'></script>"
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/webrtcRoom.js?v=" + packageJson.version + "'></script>"
	return cb();
}

exports.eejsBlock_styles = function (hookName, args, cb) {
	args.content += '<link rel="stylesheet" href="../static/plugins/ep_wrtc_heading/static/css/rtcbox.css?v=' + packageJson.version + '" type="text/css" />'
	return cb();
}

exports.clientVars = function (hook, context, callback) {
	var enabled = true
	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.enabled === false) {
		enabled = settings.ep_wrtc_heading.enabled
	}

	var iceServers = [{ url: "stun:stun.l.google.com:19302" }]
	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.iceServers) {
		iceServers = settings.ep_wrtc_heading.iceServers
	}

	var video = { sizes: {} }
	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.video && settings.ep_wrtc_heading.video.sizes) {
		video.sizes = {
			large: settings.ep_wrtc_heading.video.sizes.large,
			small: settings.ep_wrtc_heading.video.sizes.small,
		}
	}

	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.videoChatLimit) {
		VIDEOCHATLIMIT = settings.ep_wrtc_heading.videoChatLimit
	}

	var result = {
		webrtc: {
			version: packageJson.version,
			videoChatLimit: VIDEOCHATLIMIT,
			iceServers: iceServers,
			enabled: enabled,
			video: video,
		},
	}

	return callback(result);
}

exports.handleMessage = function (hook, context, callback) {
	var result = [null]
	if (context.message.type === "COLLABROOM" && context.message.data.type === "RTC_MESSAGE") {
		handleRTCMessage(context.client, context.message.data.payload)
		callback(result)
	} else if (context.message.type === "STATS" && context.message.data.type === "RTC_MESSAGE") {
		handleErrorStatMessage(context.message.data.statName)
		callback(result)
	} else {
		callback()
	}
}

function handleErrorStatMessage (statName) {
	if (statErrorNames.indexOf(statName) !== -1) {
		stats.meter("ep_wrtc_heading_err_" + statName).mark()
	} else {
		statsLogger.warn("Invalid ep_wrtc_heading error stat: " + statName)
	}
}

/**
 * Handles an RTC Message
 * @param client the client that send this message
 * @param message the message from the client
 */
function handleRTCMessage (client, payload) {
	var userId = sessioninfos[client.id].author
	var to = payload.to
	var padId = sessioninfos[client.id].padId
	var room = socketio.sockets.adapter.rooms[padId]
	var clients = []

	if (room && room.sockets) {
		for (var id in room.sockets) {
			clients.push(socketio.sockets.sockets[id])
		}
	}

	var msg = {
		type: "COLLABROOM",
		data: {
			type: "RTC_MESSAGE",
			payload: {
				from: userId,
				data: payload.data,
			},
		},
	}
	// Lookup recipient and send message
	for (var i = 0; i < clients.length; i++) {
		var session = sessioninfos[clients[i].id]
		if (session && session.author === to) {
			clients[i].json.send(msg)
			break
		}
	}
}


// ExpressJs 
