'use strict';

var share = require("ep_wrtc_heading/static/js/clientShare");
var textChat = require("ep_wrtc_heading/static/js/textChat");
var videoChat = require("ep_wrtc_heading/static/js/videoChat");

var WRTC_Room = (function () {
	var self = null;
	var socket = null;
	var padId = null;
	var VIDEOCHATLIMIT = 0;
	// var $lastJoinButton = null;
	var prefixHeaderId = 'headingTagId_';
	var hElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];

	/** --------- Helper --------- */

	function link2Clipboard(text) {
		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(text).select();
		document.execCommand('copy');
		$temp.remove();
		$.gritter.add({
			'title': 'Copied',
			'text': 'Join link copied to clip board',
			'sticky': false,
			'class_name': 'copyLinkToClipboard',
			'time': '3000'
		});
	}

	function scroll2Header(headerId) {
		var padContainer = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody');
		padContainer.find('.' + prefixHeaderId + headerId).each(function () {
			this.scrollIntoView({
				'behavior': 'smooth'
			});
		});
	}

	function joinChatRoom(headerId, userInfo, $joinBtn) {
		textChat.userJoin(headerId, userInfo, $joinBtn);
		videoChat.userJoin(headerId, userInfo, $joinBtn);
	}

	function leaveChatRoom(headerId, userInfo, $joinBtn) {
		textChat.userLeave(headerId, userInfo, $joinBtn);
		videoChat.userLeave(headerId, userInfo, $joinBtn);
	}

	/**
  * 
  * @param {string} actions @enum (JOIN|LEAVE)
  * @param {string} headerId 
  * @param {string} target @enum (chatRoom|video|text)
  */
	function roomBtnHandler(actions, headerId, target) {
		headerId = $(this).attr('data-id') || headerId;
		actions = $(this).attr('data-action') || actions;
		target = $(this).attr('data-join') || target;


		if (!headerId || !target) return true;

		var $joinBtn = $(this);

		var userInfo = {
			'padId': clientVars.padId,
			'userId': clientVars.userId,
			'userName': clientVars.userName || 'anonymous',
			'headerId': headerId,
			'target': target
		};

		if (actions === 'JOIN') {
			if ($joinBtn.length) $joinBtn.prop('disabled', true);

			switch (target) {
				case 'chatRoom':
					$joinBtn.targetPlus = true;
					share.$body_ace_outer().find(".btn_joinChat_chatRoom[data-id='" + headerId + "'] , .btn_joinChat_video[data-id='" + headerId + "'], .btn_joinChat_text[data-id='" + headerId + "']").prop('disabled', true);
					joinChatRoom(headerId, userInfo, $joinBtn);
					break;
				case 'video':
					videoChat.userJoin(headerId, userInfo, $joinBtn);
					break;
				case 'text':
					textChat.userJoin(headerId, userInfo, $joinBtn);
					break;
			}
		} else if (actions === 'LEAVE') {
			switch (target) {
				case 'chatRoom':
					leaveChatRoom(headerId, userInfo, $joinBtn);
					break;
				case 'video':
					videoChat.userLeave(headerId, userInfo, $joinBtn);
					break;
				case 'text':
					textChat.userLeave(headerId, userInfo, $joinBtn);
					break;
			}
		}
	}

	function joinByQueryString() {
		var urlParams = new URLSearchParams(window.location.search);
		var headerId = urlParams.get('id');
		var target = urlParams.get('target');
		var join = urlParams.get('join');

		if (headerId) {
			scroll2Header(headerId);
		}
		if (join === 'true') {
			if (target === 'plus') target = 'chatRoom';
			roomBtnHandler('JOIN', headerId, target);
		}
	}

	function shareRoomsLink() {
		var headId = $(this).attr("data-id");
		var target = $(this).attr("data-join");
		var title = share.$body_ace_outer().find(".wbrtc_roomBox." + headId + " .titleRoom").text();

		var origin = window.location.origin;
		var pathName = window.location.pathname;
		var link = origin + pathName + '?header=' + share.slugify(title) + '&id=' + headId + '&target=' + target + '&join=true';

		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(link).select();
		document.execCommand('copy');
		$temp.remove();

		$.gritter.add({
			'title': 'Copied',
			'text': 'Join link copied to clip board',
			'sticky': false,
			'class_name': 'copyLinkToClipboard',
			'time': '3000'
		});
	}

	function getHeaderRoomY($element) {
		var height = $element.outerHeight();
		var paddingTop = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
		var aceOuterPadding = parseInt(paddingTop, 10);
		var offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
		return offsetTop + height / 2 - 16;
	}

	function activeEventListener() {

		var $wbrtc_roomBox = share.$body_ace_outer();

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_text', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_video', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_chatRoom', roomBtnHandler);

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox button.btn_shareRoom', shareRoomsLink);

		$(document).on('click', '#werc_toolbar .btn_leave, .wrtc_text .wrtc_roomLink', roomBtnHandler);

		$(document).on('click', '#wrtc_textChatWrapper .btn_leave', roomBtnHandler);

		share.$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function () {
			$(this).addClass('active').find('.wrtc_contentBody').css({ 'display': 'block' });
		}).on('mouseleave', '.wbrtc_roomBox', function () {
			$(this).removeClass('active').find('.wrtc_contentBody').css({ 'display': 'none' });
		});

		share.$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function () {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		$(document).on('click', '#werc_toolbar p, .textChatToolbar b', function () {
			var headerId = $(this).attr('data-id');
			scroll2Header(headerId);
		});

		$(document).on('click', '#werc_toolbar .btn_enlarge', function () {
			if (!$(this).attr('active')) return true;

			$(this).toggleClass('large');

			$('#wrtc_modal .video-container .enlarge-btn').each(function () {
				$(this).trigger('click');
			});
		});

		// video interface settings
		$(document).on('click', '.settings-btn', function () {
			$(document).find('#wrtc_settings').toggleClass('active');
		});

		$(document).on('click', '#wrtc_settings .btn_close', function () {
			$('#wrtc_settings').toggleClass('active');
		});
	}

	self = {
		'aceSetAuthorStyle': function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = share.getUserFromId(context.author);
				if (user) {
					// sync user info
					// socket.emit('sync user info', window.pad.getPadId(), user, function(){})
					share.$body_ace_outer().find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
					share.$body_ace_outer().find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
				}
			}
		},
		'userLeave': function userLeave(context, callback) {
			// Deprecated, we use socket disconnect

			callback();
		},
		'bulkUpdateRooms': function bulkUpdateRooms(hTagList) {
			videoChat.bulkUpdateRooms(hTagList);
			textChat.bulkUpdateRooms(hTagList);
		},
		'postAceInit': function postAceInit(hook, context, webSocket, docId) {
			socket = webSocket;
			padId = docId || window.pad.getPadId();

			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

			socket.on('userJoin', function (data, roomInfo, target) {
				if (target === "video") {
					videoChat.gateway_userJoin(data, roomInfo, false);
				} else {
					textChat.addUserToRoom(data, roomInfo, target);
				}
			});

			socket.on('userLeave', function (data, roomInfo, target) {
				if (target === "video") {
					videoChat.gateway_userLeave(data, roomInfo, target);
				} else {
					textChat.removeUserFromRoom(data, roomInfo, target);
				}
			});

			activeEventListener();

			// check if there is a join request in URI queryString
			setTimeout(function () {
				joinByQueryString();
			}, 500);
		},
		'adoptHeaderYRoom': function adoptHeaderYRoom() {
			// Set all video_heading to be inline with their target REP
			var $padOuter = share.$body_ace_outer();
			if (!$padOuter) return;

			$padOuter.find('.wbrtc_roomBox').each(function adjustHeaderIconPosition() {
				var $el = $(this);
				var $boxId = $el.attr('id');
				var hClassId = 'headingTagId_' + $boxId;
				var $headingEl = $padOuter.find('iframe').contents().find('#innerdocbody').find('.' + hClassId);

				// if the H tags does not find, remove chatBox
				// TODO: and kick out the user form the chatBox
				if ($headingEl.length <= 0) {
					$el.remove();
					return false;
				}

				$el.css({ 'top': getHeaderRoomY($headingEl) + 'px' });
			});
		},
		'findTags': function findTags() {
			var hTagList = [];
			var hTagElements = hElements.join(',');
			var hTags = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody').children('div').children(hTagElements);
			var aceInnerOffset = share.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
			var target = share.$body_ace_outer().find('#outerdocbody');
			var newHTagAdded = false;
			$(hTags).each(function createWrtcRoomBox() {
				var $el = $(this);
				var lineNumber = $el.parent().prevAll().length;
				var tag = $el.prop('tagName').toLowerCase();
				var newY = getHeaderRoomY($el);
				var newX = Math.ceil(aceInnerOffset.left);
				var linkText = $el.text();
				var headingTagId = $el.find('span').attr('class');
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);
				if (!headingTagId) return true;

				var data = {
					'headingTagId': headingTagId[1],
					'tag': tag,
					'positionTop': newY,
					'positionLeft': newX,
					'headTitle': linkText,
					'lineNumber': lineNumber,
					'videoChatLimit': VIDEOCHATLIMIT
				};

				// if the header does not exists then adde to list
				// otherwise update textHeader
				// TODO: performance issue
				if (target.find('#' + data.headingTagId).length <= 0) {
					var box = $('#wertc_roomBox').tmpl(data);
					target.find('#wbrtc_chatBox').append(box);
					newHTagAdded = true;
				} else {
					$(document).find('[data-headid=' + data.headingTagId + '].wrtc_text .wrtc_roomLink, #werc_toolbar p[data-id=' + data.headingTagId + ']').text(data.headTitle);
					target.find('.wbrtc_roomBox[id=' + data.headingTagId + '] .titleRoom').text(data.headTitle);
					$(document).find('#wrtc_textChatWrapper[data-id=' + data.headingTagId + '] .nd_title b').text(data.headTitle);
				}

				hTagList.push(data);
			});

			clientVars.plugins.plugins.ep_wrtc_heading_room = hTagList;

			// if a new h tag addedd check all heading again!
			if (newHTagAdded) {
				self.bulkUpdateRooms(hTagList);
				newHTagAdded = false;
			}
		}
	};

	return self;
})();