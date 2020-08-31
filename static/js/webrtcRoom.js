'use strict';

var share = require('ep_wrtc_heading/static/js/clientShare');
var textChat = require('ep_wrtc_heading/static/js/textChat');
var videoChat = require('ep_wrtc_heading/static/js/videoChat');

var WRTC_Room = (function WRTC_Room() {
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
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function scroll2Header(headerId) {
		var padContainer = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody');
		padContainer.find('.' + prefixHeaderId + headerId).each(function scrolling() {
			this.scrollIntoView({
				behavior: 'smooth'
			});
		});
	}

	function joinChatRoom(headerId, userInfo, target) {
		textChat.userJoin(headerId, userInfo, 'TEXTPLUS');
		videoChat.userJoin(headerId, userInfo, 'PLUS');
	}

	function leaveChatRoom(headerId, userInfo, target) {
		textChat.userLeave(headerId, userInfo, 'TEXTPLUS');
		videoChat.userLeave(headerId, userInfo, 'PLUS');
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
			padId: clientVars.padId || window.pad.getPadId(),
			userId: clientVars.userId || window.pad.getUserId(),
			userName: clientVars.userName || 'anonymous',
			headerId: headerId,
			target: target
		};

		share.wrtcPubsub.emit('disable room buttons', headerId, actions, target);

		if (actions === 'JOIN') {
			switch (target) {
				case 'PLUS':
					$joinBtn.targetPlus = true;
					joinChatRoom(headerId, userInfo, target);
					break;
				case 'VIDEO':
					videoChat.userJoin(headerId, userInfo, target);
					break;
				case 'TEXT':
					textChat.userJoin(headerId, userInfo, target);
					break;
				default:
					return false;
			}
		} else if (actions === 'LEAVE') {
			switch (target) {
				case 'PLUS':
					leaveChatRoom(headerId, userInfo, target);
					break;
				case 'VIDEO':
					videoChat.userLeave(headerId, userInfo, target);
					break;
				case 'TEXT':
					textChat.userLeave(headerId, userInfo, target);
					break;
				default:
					return false;
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
			target = target.toUpperCase();
			roomBtnHandler('JOIN', headerId, target);
		}
	}

	function shareRoomsLink() {
		var headId = $(this).attr('data-id');
		var target = $(this).attr('data-join');
		var title = share.$body_ace_outer().find('.wbrtc_roomBox.' + headId + ' .titleRoom').text();

		var origin = window.location.origin;
		var pathName = window.location.pathname;
		var link = origin + pathName + '?header=' + share.slugify(title) + '&id=' + headId + '&target=' + target + '&join=true';

		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(link).select();
		document.execCommand('copy');
		$temp.remove();

		$.gritter.add({
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function getHeaderRoomY($element) {
		var height = $element.outerHeight();
		var paddingTop = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
		var aceOuterPadding = parseInt(paddingTop, 10);
		var offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
		return offsetTop + height / 2 - 20;
	}

	function getHeaderRoomX($element) {
		var width = $element.outerWidth();
		var paddingLeft = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-left');
		var aceOuterPadding = parseInt(paddingLeft, 10);
		var offsetLeft = Math.ceil(share.$body_ace_outer().find('iframe[name="ace_inner"]').offset().left - aceOuterPadding);
		return offsetLeft - width;
	}

	function activeEventListener() {
		var $wbrtc_roomBox = share.$body_ace_outer();

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_text', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_video', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_chatRoom', roomBtnHandler);

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox button.btn_shareRoom', shareRoomsLink);

		$(document).on('click', '#werc_toolbar .btn_leave, #chattext .wrtc_roomLink', roomBtnHandler);

		$(document).on('click', '#wrtc_textChatWrapper .btn_leave', roomBtnHandler);

		share.$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function mouseenter() {
			$(this).parent().css({ overflow: 'initial' });
			$(this).addClass('active').find('.wrtc_contentBody').css({ display: 'block' });
		}).on('mouseleave', '.wbrtc_roomBox', function mouseleave() {
			$(this).parent().css({ overflow: 'hidden' });
			$(this).removeClass('active').find('.wrtc_contentBody').css({ display: 'none' });
		});

		share.$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function click() {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		share.$body_ace_outer().on('mouseenter', '.wrtc_roomInlineAvatar .avatar', function mouseenter() {
			var id = $(this).parent().parent().attr('id');
			share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseenter');
		}).on('mouseleave', '.wrtc_roomInlineAvatar .avatar', function mouseleave() {
			var id = $(this).parent().parent().attr('id');
			share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseleave');
		});

		$(document).on('click', '#werc_toolbar p, .textChatToolbar b', function click() {
			var headerId = $(this).attr('data-id');
			scroll2Header(headerId);
		});

		$(document).on('click', '#werc_toolbar .btn_enlarge', function click() {
			if (!$(this).attr('active')) return true;

			$(this).toggleClass('large');

			$('#wrtc_modal .video-container .enlarge-btn').each(function trigger() {
				$(this).trigger('click');
			});
		});

		// video interface settings
		$(document).on('click', '.settings-btn', function click() {
			$(document).find('#wrtc_settings').toggleClass('active');
		});

		$(document).on('click', '#wrtc_settings .btn_close', function click() {
			$('#wrtc_settings').toggleClass('active');
		});
	}

	self = {
		getHeaderRoomX: getHeaderRoomX,
		aceSetAuthorStyle: function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = share.getUserFromId(context.author);
				if (user) {
					// sync user info
					share.$body_ace_outer().find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
					share.$body_ace_outer().find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
				}
			}
		},
		userLeave: function userLeave(context, callback) {
			// Deprecated, we use socket disconnect

			callback();
		},
		bulkUpdateRooms: function bulkUpdateRooms(hTagList) {
			videoChat.bulkUpdateRooms(hTagList);
			textChat.bulkUpdateRooms(hTagList);
		},
		postAceInit: function postAceInit(hook, context, webSocket, docId) {
			socket = webSocket;
			padId = docId || window.pad.getPadId();

			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

			socket.on('userJoin', function (data, roomInfo, target) {
				if (target === 'video') {
					videoChat.gateway_userJoin(data, roomInfo, false);
				} else {
					textChat.addUserToRoom(data, roomInfo, target);
				}
			});

			socket.on('userLeave', function (data, roomInfo, target) {
				if (target === 'video') {
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
		adoptHeaderYRoom: function adoptHeaderYRoom() {
			// Set all video_heading to be inline with their target REP
			var $padOuter = share.$body_ace_outer();
			if (!$padOuter) return;

			$padOuter.find('.wbrtc_roomBox, .wrtc_roomInlineAvatar ').each(function adjustHeaderIconPosition() {
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

				if ($el.attr('data-box') === 'avatar') $el.css({ left: getHeaderRoomX($el) + 'px' });
				$el.css({ top: getHeaderRoomY($headingEl) + 'px' });
			});
		},
		findTags: function findTags() {
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
					headingTagId: headingTagId[1],
					tag: tag,
					positionTop: newY,
					positionLeft: newX,
					headTitle: linkText,
					lineNumber: lineNumber,
					videoChatLimit: VIDEOCHATLIMIT
				};

				if (!share.wrtcStore[data.headingTagId]) share.wrtcStore[data.headingTagId] = { VIDEO: { list: [] }, TEXT: { list: [] }, USERS: {} };

				// if the header does not exists then adde to list
				// otherwise update textHeader
				// TODO: performance issue
				if (target.find('#' + data.headingTagId).length <= 0) {
					var box = $('#wertc_roomBox').tmpl(data);
					target.find('#wbrtc_chatBox').append(box);

					var avatarBox = $('#wertc_inlineAvatar').tmpl(data);
					target.find('#wbrtc_avatarCol').append(avatarBox);

					newHTagAdded = true;
				} else {
					$(document).find('[data-headid=' + data.headingTagId + '].wrtc_text .wrtc_roomLink, #werc_toolbar p[data-id=' + data.headingTagId + ']').text(data.headTitle);
					target.find('.wbrtc_roomBox[id=' + data.headingTagId + '] .titleRoom').text(data.headTitle);
					$(document).find('#wrtc_textChatWrapper[data-id=' + data.headingTagId + '] .nd_title b').text(data.headTitle);
				}

				hTagList.push(data);
			});

			// clientVars.plugins.plugins.ep_wrtc_heading_room = hTagList;

			// if a new h tag addedd check all heading again!
			if (newHTagAdded) {
				self.bulkUpdateRooms(hTagList);
				newHTagAdded = false;
			}
		}
	};

	return self;
})();