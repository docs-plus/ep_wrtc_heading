var $ = require("ep_etherpad-lite/static/js/rjquery").$
var _ = require("ep_etherpad-lite/static/js/underscore")
var randomString = require("ep_etherpad-lite/static/js/pad_utils").randomString
var cssFiles = ["ep_wrtc_heading/static/css/wrtcRoom.css"]

/************************************************************************/
/*                              Plugin                                  */
/************************************************************************/

function ep_wrtcHeading (context) {
	this.container = null
	this.padOuter = null
	this.padInner = null
	this.padId = clientVars.padId
	this.init()
}

ep_wrtcHeading.prototype.init = function () {
	var _self = this
	this.findContainers()
	this.insertContainers()

	$("#options-wrtc-heading").on("change", function () {
		$("#options-wrtc-heading").is(":checked") ? enableWrtcHeading() : disableWrtcHeading()
	})

	function enableWrtcHeading () {
		_self.padOuter.find("#comments").addClass("active")
		console.log("enableWrtcHeading")
	}

	function disableWrtcHeading () {
		_self.padOuter.find("#comments").removeClass("active")
		console.log("disableWrtcHeading")
	}

	$("#options-wrtc-heading").trigger("change")

	WRTC_Room.initSocketJoin()
}

ep_wrtcHeading.prototype.getUserFromId = function (userId) {
	if (!this._pad || !this._pad.collabClient) return null
	var result = this._pad.collabClient.getConnectedUsers().filter(function (user) {
		return user.userId === userId
	})
	var user = result.length > 0 ? result[0] : null
	return user
}

ep_wrtcHeading.prototype.findContainers = function () {
	var padOuter = $('iframe[name="ace_outer"]').contents()
	this.padOuter = padOuter
	this.padInner = padOuter.find('iframe[name="ace_inner"]')
	this.outerBody = padOuter.find("#outerdocbody")
}

ep_wrtcHeading.prototype.insertContainers = function () {
	var $target = this.outerBody
	// if ep_comments plugin eneable don't append container again
	if ($target.find("#comments").length > 0) return false
	// Add comments side bar container
	$target.prepend('<div id="comments"></div>')
}

// Set all video_heading to be inline with their target REP
ep_wrtcHeading.prototype.setYofHeadingBox = function () {
	var $padOuter = this.padOuter
	var $padInner = this.padInner

	$padOuter.find(".wbrtc_roomBox").each(function (index) {
		var $boxId = $(this).attr("id")
		var hClassId = "headingTagId_" + $boxId.split("_")[2]
		var aceOuterPadding = parseInt($padInner.css("padding-top"))
		var $headingEl = $padOuter
			.find("iframe")
			.contents()
			.find("#innerdocbody")
			.find("." + hClassId)

		// if the H tags does not find remove chatBox
		if ($headingEl.length <= 0) {
			$(this).remove()
			return false
		}

		var offsetTop = $headingEl.offset().top + aceOuterPadding

		$(this).css({ top: offsetTop + "px" })
	})
}

/************************************************************************/
/*                           Etherpad Hooks                             */
/************************************************************************/
var hooks = {
	postAceInit: function (hook, context) {
		WRTC.postAceInit(hook, context)
		if (!pad.plugins) pad.plugins = {}
		var WRTCHeading = new ep_wrtcHeading(context)
		this.WRTCHeading = WRTCHeading
		pad.plugins.ep_wrtc_heading = WRTCHeading

		if (!$("#editorcontainerbox").hasClass("flex-layout")) {
			$.gritter.add({
				title: "Error",
				text: "ep_wrtc_heading: Please upgrade to etherpad 1.8.3 for this plugin to work correctly",
				sticky: true,
				class_name: "error",
			})
		}

		$(window).resize(
			_.debounce(function () {
				WRTCHeading.setYofHeadingBox()
			}, 100),
		)

		WRTCHeading.init()
		WRTC_Room.init(context)

		// if ep_comments_page active this delay needed.
		setTimeout(function () {
			WRTC_Room.findTags()
		}, 150)
	},

	aceEditEvent: function (hook, context) {
		// first check if some text is being marked/unmarked to add comment to it
		var eventType = context.callstack.editEvent.eventType

		// if user create a new heading
		// if in insert heading mode or when press key with new line
		if ("setup,importText,setBaseText,setWraps".includes(eventType)) return

		// some times on init ep_wrtc_heading is not yet on the plugin list
		if (context.callstack.docTextChanged) pad.plugins.ep_wrtc_heading.setYofHeadingBox()
		if (eventType === "applyChangesToBase" && context.callstack.selectionAffected) {
			setTimeout(function () {
				WRTC_Room.findTags()
			}, 200)
		}

		if (eventType === "insertheading") {
			// unfortunately "setAttributesRange" takes a little time to set attribute
			// also ep_headings2 plugin has setTimeout about 250 ms to set and update H tag
			// more info: https://github.com/ether/ep_headings2/blob/6827f1f0b64d99c3f3082bc0477d87187073a74f/static/js/index.js#L71
			setTimeout(function () {
				WRTC_Room.findTags()
			}, 200)
		}
	},
	aceAttribsToClasses: function (hook, context) {
		if (context.key === "headingTagId") {
			return ["headingTagId_" + context.value]
		}
	},
	aceEditorCSS: function () {
		return cssFiles
	},
	aceSetAuthorStyle: function (hook, context, callback) {
		if (context.author) {
			var user = pad.collabClient.getConnectedUsers().find(function (user) {
				return user.userId === context.author
			})
			if (user) {
				var padOuter = $('iframe[name="ace_outer"]').contents()
				padOuter
					.find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']")
					.css({ "border-color": user.colorId })
					.text(user.name)
			}
		}
		WRTC.aceSetAuthorStyle(hook, context, callback)
	},
	userLeave: function (hook, context, callback) {
		WRTC.userLeave(hook, context, callback)
		var userId = context.userInfo.userId
		var data = {
			padId: clientVars.padId,
			userId: userId,
		}

		WRTC_Room.leaveSession(data)
	},
	userJoinOrUpdate: function (hook, context, callback) {
		WRTC.userJoinOrUpdate(hook, context, callback)
	},
	handleClientMessage_RTC_MESSAGE: function (hook, context, callback) {
		WRTC.handleClientMessage_RTC_MESSAGE(hook, context, callback)
	},
	aceSelectionChanged: function (rep, context) {
		if (context.callstack.type === "insertheading") {
			rep = context.rep
			var headingTagId = ["headingTagId", randomString(16)]
			context.documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [headingTagId])
		}
	},
}

exports.postAceInit = hooks.postAceInit
exports.aceEditorCSS = hooks.aceEditorCSS
exports.aceAttribsToClasses = hooks.aceAttribsToClasses
exports.aceEditEvent = hooks.aceEditEvent
exports.aceSetAuthorStyle = hooks.aceSetAuthorStyle
exports.userLeave = hooks.userLeave
exports.userJoinOrUpdate = hooks.userJoinOrUpdate
exports.handleClientMessage_RTC_MESSAGE = hooks.handleClientMessage_RTC_MESSAGE

exports.aceSelectionChanged = hooks.aceSelectionChanged
