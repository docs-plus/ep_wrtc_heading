var $ = require("ep_etherpad-lite/static/js/rjquery").$;
var _ = require("ep_etherpad-lite/static/js/underscore");
var randomString = require("ep_etherpad-lite/static/js/pad_utils").randomString;
var events = require("ep_wrtc_heading/static/js/copyPasteEvents");


/** **********************************************************************/
/*                              Plugin                                  */
/** **********************************************************************/

var EPwrtcHeading = (function () {
	var padOuter = null;
	var padInner = null;
	var outerBody = null;

	function enableWrtcHeading () {
		padOuter.find("#wbrtc_chatBox").addClass("active");
		$("#rtcbox").addClass("active");
	}

	function disableWrtcHeading () {
		padOuter.find("#wbrtc_chatBox").removeClass("active");
		$("#rtcbox").removeClass("active");
		WRTC_Room.hangupAll();
	}

	function init (ace) {

		// join the user to WRTC room
		WRTC_Room.initSocketJoin();

		// find containers
		padOuter = $("iframe[name=\"ace_outer\"]").contents();
		padInner = padOuter.find("iframe[name=\"ace_inner\"]");
		outerBody = padOuter.find("#outerdocbody");

		// insert wbrtc containers
		var $target = outerBody;
		if ($target.find("#wbrtc_chatBox").length) return false;
		$target.prepend("<div id=\"wbrtc_chatBox\"></div>");

		// module settings
		$("#options-wrtc-heading").on("change", function () {
			$("#options-wrtc-heading").is(":checked") ? enableWrtcHeading() : disableWrtcHeading();
		});

		$("#options-wrtc-heading").trigger("change");

		if(browser.chrome || browser.firefox) {

			padInner.contents().on("copy", function (e) {
				events.addTextOnClipboard(e, ace, padInner, false);
			});

			padInner.contents().on("cut", function (e) {
				events.addTextOnClipboard(e, ace, padInner, true);
			});

		}

	}

	return Object.freeze({
		"init": init,
	});
})();

/** **********************************************************************/
/*                           Etherpad Hooks                             */
/** **********************************************************************/

var hooks = {
	"postAceInit": function postAceInit (hook, context) {

		if (!$("#editorcontainerbox").hasClass("flex-layout")) {
			$.gritter.add({
				"title": "Error",
				"text": "ep_wrtc_heading: Please upgrade to etherpad 1.8.3 for this plugin to work correctly",
				"sticky": true,
				"class_name": "error"
			});
		}

		var ace = context.ace;

		EPwrtcHeading.init(ace);
		WRTC.postAceInit(hook, context);
		WRTC_Room.init(context);

		$("#editorcontainer iframe").ready(function () {
			WRTC.appendInterfaceLayout();
			setTimeout(function () {
				WRTC_Room.findTags();
			}, 250);
		});

		$(window).resize(_.debounce(function () {
			WRTC_Room.adoptHeaderYRoom();
		}, 100));

	},
	"aceEditEvent": function aceEditEvent (hook, context) {
		var eventType = context.callstack.editEvent.eventType;

		// ignore these types
		if ("handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps".includes(eventType)) return;

		// some times init ep_wrtc_heading is not yet in the plugin list
		if (context.callstack.docTextChanged) WRTC_Room.adoptHeaderYRoom();

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
	"aceAttribsToClasses": function aceAttribsToClasses (hook, context) {
		if (context.key === "headingTagId") {
			return ["headingTagId_" + context.value];
		}
	},
	"aceEditorCSS": function aceEditorCSS () {
		var version = clientVars.webrtc.version || 1;
		return ["ep_wrtc_heading/static/css/wrtcRoom.css?v=" + version + ""];
	},
	"aceSetAuthorStyle": function aceSetAuthorStyle (hook, context) {
		WRTC_Room.aceSetAuthorStyle(context);
		WRTC.aceSetAuthorStyle(context);
	},
	"userLeave": function userLeave (hook, context, callback) {
		WRTC_Room.userLeave(context, callback);
		WRTC.userLeave(hook, context, callback);
	},
	"handleClientMessage_RTC_MESSAGE": function handleClientMessage_RTC_MESSAGE (hook, context) {
		WRTC.handleClientMessage_RTC_MESSAGE(hook, context);
	},
	"aceSelectionChanged": function aceSelectionChanged (rep, context) {
		if (context.callstack.type === "insertheading") {
			rep = context.rep;
			var headingTagId = ["headingTagId", randomString(16)];
			context.documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [headingTagId]);
		}
	},
	"aceInitialized": function aceInitialized (hook, context) {
		var editorInfo = context.editorInfo;
		editorInfo.ace_hasHeaderOnSelection = _(events.hasHeaderOnSelection).bind(context);

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
exports.aceInitialized = hooks.aceInitialized;
