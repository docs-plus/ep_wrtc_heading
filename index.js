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
	var rooms = []
	io.of("/heading_chat_room").on("connect", function (socket) {
		
		socket.on("joinPadRooms", function (padId, callback) {
			socket.join(padId)
		})

		socket.on("userJoin", function (data, callback) {
			// find user in current pad, user can only join in one heading room in each pad section
			var findUserInPad = rooms.find(x => x.padId === data.padId && x.userId === data.userId)
			if (findUserInPad) return false;

			var usersInCurrentRoom = rooms.filter(x => x.headingId === data.headingId && x.padId === data.padId)

			var users = {
				present: usersInCurrentRoom.length,
				list: usersInCurrentRoom
			};

			data = { ...data, users }

			if(users.present < VIDEOCHATLIMIT){
				rooms.push(data);
				socket.broadcast.to(data.padId).emit("userJoin", data)
			}

			callback(data)
		})

		socket.on("userLeave", function (data, callback) {
			rooms = rooms.filter(x => !(x.headingId === data.headingId && x.padId === data.padId && x.userId === data.userId))
			var userInCurrentRoom = rooms.filter(x => x.headingId === data.headingId && x.padId === data.padId)
			Object.assign(data, { userCount: userInCurrentRoom.length })

			socket.broadcast.to(data.padId).emit("userLeave", data)
			callback(data)
		})

		socket.on("leaveSession", function (data, callback) {
			rooms = rooms.filter(x => !(x.padId === data.padId && x.userId === data.userId))
			var userInCurrentRoom = rooms.filter(x => x.headingId === data.headingId && x.padId === data.padId)
			Object.assign(data, { userCount: userInCurrentRoom.length })

			socket.broadcast.to(data.padId).emit("userLeave", data)
			callback(data)
		})

		// remove the room that not available and excrete user from room
		socket.on("bulkUpdateRooms", function (padId, heading, callback) {
			rooms = rooms.filter(el => heading.find(x => x.headingTagId === el.headingId))
			socket.broadcast.to(padId).emit("bulkUpdateRooms", rooms)
			callback(rooms)
		})
	})
}

exports.eejsBlock_mySettings = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/settings.ejs")
	return cb();
}

exports.eejsBlock_scripts = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/webrtcComponent.html", {}, module)
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/adapter.js?v=" + packageJson.version + "'></script>"
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/getUserMediaPolyfill.js?v=" + packageJson.version + "'></script>"
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/webrtc.js?v=" + packageJson.version + "'></script>"
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/webrtcRoom.js?v=" + packageJson.version + "'></script>"
	return cb();
}

exports.eejsBlock_styles = function (hookName, args, cb) {
	args.content += '<link rel="stylesheet" href="../static/plugins/ep_wrtc_heading/static/css/rtcbox.css?v=' + packageJson.version + '" type="text/css" />'
	return cb();
}

exports.eejsBlock_editorContainerBox = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/webrtc.ejs", {}, module)
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
