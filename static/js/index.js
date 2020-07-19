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

	return Object.freeze({
		init: init,
	});
})();

/************************************************************************/
/*                           Etherpad Hooks                             */
/************************************************************************/

var getFirstColumnOfSelection = function(line, rep, firstLineOfSelection){
  return line !== firstLineOfSelection ? 0 : rep.selStart[1];
};

var getLength = function(line, rep) {
  var nextLine = line + 1;
  var startLineOffset = rep.lines.offsetOfIndex(line);
  var endLineOffset   = rep.lines.offsetOfIndex(nextLine);

  //lineLength without \n
  var lineLength = endLineOffset - startLineOffset - 1;

  return lineLength;
};

var getLastColumnOfSelection = function(line, rep, lastLineOfSelection){
  var lastColumnOfSelection;
  if (line !== lastLineOfSelection) {
    lastColumnOfSelection = getLength(line, rep); // length of line
  }else{
    lastColumnOfSelection = rep.selEnd[1] - 1; //position of last character selected
  }
  return lastColumnOfSelection;
};

var hasCommentOnMultipleLineSelection = function(firstLineOfSelection, lastLineOfSelection, rep, attributeManager){
  var foundLineWithComment = false;
  for (var line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithComment; line++) {
    var firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
    var lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
    var hasComment = hasCommentOnLine(line, firstColumn, lastColumn, attributeManager);
    if (hasComment){
      foundLineWithComment = true;
    }
  }
  return foundLineWithComment;
}

var hasCommentOnLine = function(lineNumber, firstColumn, lastColumn, attributeManager){
	var foundHeadOnLine = false;
	var headId = null;
  for (var column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
    headId = _.object(attributeManager.getAttributesOnPosition(lineNumber, column)).headingTagId;
    if (headId !== undefined){
      foundHeadOnLine = true;
    }
  }
  return {foundHeadOnLine: foundHeadOnLine, headId: headId};
};

var hasMultipleLineSelected = function(firstLineOfSelection, lastLineOfSelection){
  return  firstLineOfSelection !== lastLineOfSelection;
};

var hasHeaderOnSelection = function() {
  var hasVideoHeader;
  var attributeManager = this.documentAttributeManager;
  var rep = this.rep;
  var firstLineOfSelection = rep.selStart[0];
  var firstColumn = rep.selStart[1];
  var lastColumn = rep.selEnd[1];
  var lastLineOfSelection = rep.selEnd[0];
  var selectionOfMultipleLine = hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection);
	
  if(selectionOfMultipleLine){
    hasVideoHeader = hasCommentOnMultipleLineSelection(firstLineOfSelection,lastLineOfSelection, rep, attributeManager);
  }else{
    hasVideoHeader = hasCommentOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager)
	}
  return {hasVideoHeader: hasVideoHeader.foundHeadOnLine, headId: hasVideoHeader.headId,  hasMultipleLine: selectionOfMultipleLine};
};

function getSelectionHtml() {

	padOuter = $('iframe[name="ace_outer"]').contents();
	padInner = padOuter.find('iframe[name="ace_inner"]');
	outerBody = padOuter.find("#outerdocbody");

	var html = "";
	if (typeof window.getSelection != "undefined") {
		var sel = padInner.contents()[0].getSelection();
		if (sel.rangeCount) {
			var container = document.createElement("div");
			for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			html = container.innerHTML;
		}
	} else if (typeof document.selection != "undefined") {
		if (document.selection.type == "Text") {
			html = document.selection.createRange().htmlText;
		}
	}
	return html;
}

function selectionMultipleLine() {
	var rawHtml = getSelectionHtml()
	rawHtml = $("<div></div>").append(rawHtml)
	rawHtml.find(":header span").removeClass(function (index, css) {
		return (css.match(/\headingTagId_\S+/g) || []).join(' '); 
	}).addClass(function( index, css ) {
		return 'headingTagId_' + randomString(16) + ' ' + css;
	});
	return rawHtml.html()
}

function selectionOneLine(headerId){
	var hTag = padInner.contents().find(".headingTagId_"+headerId).closest(":header")[0].tagName;
	var content = padInner.contents().find(".headingTagId_"+headerId)
	.closest(":header span").removeClass(function (index, css) {
		return (css.match(/\headingTagId_\S+/g) || []).join(' '); 
	}).html();
	const rawHtml = $("<div></div>").append("<" + hTag + "><span class='headingTagId_" + randomString(16) + "'>" + content + "</span></" + hTag + ">")
	return rawHtml.html() ;
}

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
			WRTC_Room.adoptHeaderYRoom();
		}, 100));


		padOuter = $('iframe[name="ace_outer"]').contents();
		padInner = padOuter.find('iframe[name="ace_inner"]');
		outerBody = padOuter.find("#outerdocbody");

	var ace = context.ace
		
	if(browser.chrome || browser.firefox){

    padInner.contents().on("copy", function(e) {
			events.addTextOnClipboard(e, ace, padInner, false)
		});

    self.padInner.contents().on("cut", function(e) {
      events.addTextOnClipboard(e, ace, padInner, true);
    });

  }


	},
	aceEditEvent: function aceEditEvent(hook, context) {
		var eventType = context.callstack.editEvent.eventType;

		// ignore these types
		if ("handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps".includes(eventType)) return;

		// some times init ep_wrtc_heading is not yet in the plugin list
		if (context.callstack.docTextChanged ) WRTC_Room.adoptHeaderYRoom();

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
		WRTC_Room.userLeave(context, callback);
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
	},
	aceInitialized: function aceInitialized(hook, context){
		var editorInfo = context.editorInfo;
		editorInfo.ace_hasHeaderOnSelection = _(hasHeaderOnSelection).bind(context);

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
