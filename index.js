var eejs = require("ep_etherpad-lite/node/eejs/")
const _ = require('lodash');
var settings = require("ep_etherpad-lite/node/utils/Settings")
var log4js = require("ep_etherpad-lite/node_modules/log4js")

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

console.log(require('./server/socket'), "========3333")
const {socketInit, socketIo, handleRTCMessage} =  require('./server/socket')


exports.socketio = socketInit


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
