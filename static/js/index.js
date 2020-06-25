var $ = require("ep_etherpad-lite/static/js/rjquery").$;
var _ = require("ep_etherpad-lite/static/js/underscore");
var randomString = require("ep_etherpad-lite/static/js/pad_utils").randomString;


/************************************************************************/
/*                              Plugin                                  */
/************************************************************************/

var EPwrtcHeading = (function () {
	var padOuter = null;
	var padInner = null;
	var outerBody = null;

	function enableWrtcHeading() {
		padOuter.find("#wbrtc_chatBox").addClass("active");
		$("#rtcbox").addClass("active");
	}

	function disableWrtcHeading() {
		padOuter.find("#wbrtc_chatBox").removeClass("active");
		$("#rtcbox").removeClass("active");
		WRTC_Room.hangupAll();
	}

	function init() {

		// join the user to WRTC room
		WRTC_Room.initSocketJoin();

		// find containers
		padOuter = $('iframe[name="ace_outer"]').contents();
		padInner = padOuter.find('iframe[name="ace_inner"]');
		outerBody = padOuter.find("#outerdocbody");

		// insert wbrtc containers
		var $target = outerBody;
		if ($target.find("#wbrtc_chatBox").length) return false;
		$target.prepend('<div id="wbrtc_chatBox"></div>');

		// module settings
		$("#options-wrtc-heading").on("change", function () {
			$("#options-wrtc-heading").is(":checked") ? enableWrtcHeading() : disableWrtcHeading();
		});

		$("#options-wrtc-heading").trigger("change");

	}

	// Set all video_heading to be inline with their target REP
	function setYofHeadingBox () {
		var $padOuter = $('iframe[name="ace_outer"]').contents()
		if(!$padOuter) return;
		$padOuter.find(".wbrtc_roomBox").each(function (index) {
			var $boxId = $(this).attr("id");
			var hClassId = "headingTagId_" + $boxId;
			var aceOuterPadding = parseInt($padOuter.find('iframe[name="ace_inner"]').css("padding-top"));
			var $headingEl = $padOuter.find("iframe").contents().find("#innerdocbody").find("." + hClassId);

			// if the H tags does not find remove chatBox
			// TODO: and kick out the user form the chatBox
			if ($headingEl.length <= 0) {
				$(this).remove();
				return false;
			}

			var offsetTop = Math.floor($headingEl.offset().top + aceOuterPadding);

			$(this).css({ top: offsetTop + "px" });
		});
	};

	return Object.freeze({
		init: init,
		setYofHeadingBox: setYofHeadingBox
	});
})();

/************************************************************************/
/*                           Etherpad Hooks                             */
/************************************************************************/
var hooks = {
	postAceInit: function postAceInit(hook, context) {

		if (!$("#editorcontainerbox").hasClass("flex-layout")) {
			$.gritter.add({
				title: "Error",
				text: "ep_wrtc_heading: Please upgrade to etherpad 1.8.3 for this plugin to work correctly",
				sticky: true,
				class_name: "error"
			});
		}

		EPwrtcHeading.init();
		WRTC.postAceInit(hook, context);
		WRTC_Room.init(context);

		$("#editorcontainer iframe").ready(function () {
			WRTC.appendInterfaceLayout();
			setTimeout(function () {
				WRTC_Room.findTags();
			}, 250);
		});

		$(window).resize(_.debounce(function () {
			EPwrtcHeading.setYofHeadingBox();
		}, 100));

	},
	aceEditEvent: function aceEditEvent(hook, context) {
		var eventType = context.callstack.editEvent.eventType;

		// ignore these types
		if ("handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps".includes(eventType)) return;

		// some times init ep_wrtc_heading is not yet in the plugin list
		if (context.callstack.docTextChanged ) EPwrtcHeading.setYofHeadingBox();

		// apply changes to the other user
		if (eventType === "applyChangesToBase" && context.callstack.selectionAffected) {
			setTimeout(function () {
				WRTC_Room.findTags();
			}, 250);
		}

		// if user create a new heading, depend on ep_headings2
		if (eventType === "insertheading") {
			// unfortunately "setAttributesRange" takes a little time to set attribute
			// also ep_headings2 plugin has setTimeout about 250 ms to set and update H tag
			// more info: https://github.com/ether/ep_headings2/blob/6827f1f0b64d99c3f3082bc0477d87187073a74f/static/js/index.js#L71
			setTimeout(function () {
				WRTC_Room.findTags();
			}, 250);
		}
	},
	aceAttribsToClasses: function aceAttribsToClasses(hook, context) {
		if (context.key === "headingTagId") {
			return ["headingTagId_" + context.value];
		}
	},
	aceEditorCSS: function aceEditorCSS() {
		var version = clientVars.webrtc.version || 1
		return ["ep_wrtc_heading/static/css/wrtcRoom.css?v=" + version + ""];
	},
	aceSetAuthorStyle: function aceSetAuthorStyle(hook, context) {
		WRTC_Room.aceSetAuthorStyle(context);
		WRTC.aceSetAuthorStyle(context);
	},
	userLeave: function userLeave(hook, context, callback) {
		var userId = context.userInfo.userId;
		var data = {
			padId: clientVars.padId,
			userId: userId
		};
		WRTC_Room.leaveSession(data);
		WRTC.userLeave(hook, context, callback);
	},
	handleClientMessage_RTC_MESSAGE: function handleClientMessage_RTC_MESSAGE(hook, context) {
		WRTC.handleClientMessage_RTC_MESSAGE(hook, context);
	},
	aceSelectionChanged: function aceSelectionChanged(rep, context) {
		if (context.callstack.type === "insertheading") {
			rep = context.rep;
			var headingTagId = ["headingTagId", randomString(16)];
			context.documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [headingTagId]);
		}
	}
};

exports.postAceInit = hooks.postAceInit;
exports.aceEditorCSS = hooks.aceEditorCSS;
exports.aceAttribsToClasses = hooks.aceAttribsToClasses;
exports.aceEditEvent = hooks.aceEditEvent;
exports.aceSetAuthorStyle = hooks.aceSetAuthorStyle;
exports.userLeave = hooks.userLeave;
exports.handleClientMessage_RTC_MESSAGE = hooks.handleClientMessage_RTC_MESSAGE;
exports.aceSelectionChanged = hooks.aceSelectionChanged;
