var eejs = require("ep_etherpad-lite/node/eejs/")
const _ = require('lodash');
var settings = require("ep_etherpad-lite/node/utils/Settings")
let socketIo = null
var log4js = require("ep_etherpad-lite/node_modules/log4js")
var sessioninfos = require("ep_etherpad-lite/node/handler/PadMessageHandler").sessioninfos
var statsLogger = log4js.getLogger("stats")
var stats = require("ep_etherpad-lite/node/stats")
var packageJson = require('./package.json');
const db = require("./server/dbRepository")
// Make sure any updates to this are reflected in README
var statErrorNames = ["Abort", "Hardware", "NotFound", "NotSupported", "Permission", "SecureConnection", "Unknown"]

let Config = require("./config")

const videoChat = require("./server/videoChat")
const textChat = require("./server/textChat")

let VIDEO_CHAT_LIMIT = Config.get("VIDEO_CHAT_LIMIT")

exports.socketio = function (hookName, args, cb) {
	socketIo = args.io
	const io = args.io

	io.of("/heading_chat_room").on("connect", function (socket) {

		socket.on("join pad", function (padId ,userId, callback) {
			socket.ndHolder = {video: {}, text: {}}

			socket.ndHolder.video = {userId, padId}
			socket.ndHolder.text = {userId, padId}
			socket.join(padId)
			callback(null)
		})

		socket.on("userJoin", (padId, userData, target, callback) => {
			let room = null

			if(target === "video"){
				room = videoChat.socketUserJoin(userData)
				_.set(socket, 'ndHolder.video', room.data)
			}else{
				room = textChat.socketUserJoin(userData)
				_.set(socket, 'ndHolder.text', room.data)
			}

			if(room.canUserJoin) {
				socket.broadcast.to(padId).emit("userJoin", room.data, room.info, target)
				callback(room.data, room.info, target)
			} else {
				callback(null, room.info, target)
			}
		})

		socket.on("userLeave", (padId, userData, target, callback) => {
			let room = null

			if(target === "video")
				room = videoChat.socketUserLeave(userData)
			else
				room = textChat.socketUserLeave(userData)

			if(!room.data || !room.info) return callback(null, null, target);

			socket.broadcast.to(padId).emit("userLeave", room.data, room.info, target)
			callback(room.data, room.info, target)
		})

		socket.on('getTextMessages', async (padId, headId, pagination, callback) => {
			// get last message id, then get last newest message, then send to client
			const messages = await textChat.getMessages(padId, headId, pagination)
					.catch(error => {
						throw new Error('[socket]: get text messages has an error, ' + error.message)
					})

			callback(messages)
		})

		socket.on("sendTextMessage", async (padId, headId, message, callback) =>  {
				// save text message and get messageId
				// combine message with messageId then past back to user
				// then broad cast to pad
				const messageId = await textChat.save(padId, headId, message)
					.catch(error => {
						throw new Error('[socket]: send text message has an error, ' + error.message)
					})

				socket.broadcast.to(padId).emit(`receiveTextMessage:${headId}`, headId, message)
				callback(message, messageId)
		})

		socket.on("bulkUpdateRooms", (padId, hTagList, target, callback) => {
			
			let room = null;

			if(target === 'video'){
				room = videoChat.socketBulkUpdateRooms(padId, hTagList)
			} else {
				room = textChat.socketBulkUpdateRooms(padId, hTagList)
			}

			if(!room.collection || !room.info) return false

			// socket.broadcast.to(padId).emit(`bulkUpdateRooms:${target}`, room.collection, room.info, target)
			callback(room.collection, room.info, target)
		})

		socket.on('disconnect', () => {
			// remove the user from text and video chat
			const userData = socket.ndHolder

			// in the case when pad does not load plugin properly,
			// there is no 'ndHolder'(userData)
			if(!userData || !userData.text || !userData.video) return false;

			const targetRoom = Object.keys(userData).filter(room => userData[room].headerId && room)

			targetRoom.forEach(chatRoom => {
				let room = null

				if(chatRoom === "video")
					room = videoChat.socketDisconnect(userData[chatRoom])
				else if (chatRoom === "text")
					room = textChat.socketDisconnect(userData[chatRoom])

				if(room && room.padId)
					socket.broadcast.to(room.padId).emit("userLeave", room.data, room.roomInfo, chatRoom)
			})

		})

	})
}

exports.eejsBlock_mySettings = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/settings.ejs")
	return cb();
}

exports.eejsBlock_scripts = function (hookName, args, cb) {
	args.content = args.content + eejs.require("ep_wrtc_heading/templates/webrtcComponent.html", {}, module)
	args.content += "<script src='../static/plugins/ep_wrtc_heading/static/js/wrtc.heading.mini.js?v=" + packageJson.version + "' defer></script>"
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

	var video = { sizes: {}, codec: Config.get("VIDEO_CODEC")}
	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.video && settings.ep_wrtc_heading.video.sizes) {
		video.sizes = {
			large: settings.ep_wrtc_heading.video.sizes.large,
			small: settings.ep_wrtc_heading.video.sizes.small,
		}
	}

	if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.videoChatLimit) {
		VIDEO_CHAT_LIMIT = Config.update("VIDEO_CHAT_LIMIT", settings.ep_wrtc_heading.videoChatLimit)
	}

	if(settings.ep_wrtc_heading && settings.ep_wrtc_heading.videoCodec) {
		video.codec = settings.ep_wrtc_heading.videoCodec
	}

	var result = {
		webrtc: {
			version: packageJson.version,
			videoChatLimit: Config.get("VIDEO_CHAT_LIMIT"),
			inlineAvatarLimit: Config.get("INLINE_AVATAR_LIMIT"),
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
	var room = socketIo.sockets.adapter.rooms[padId]
	var clients = []

	if (room && room.sockets) {
		for (var id in room.sockets) {
			clients.push(socketIo.sockets.sockets[id])
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
