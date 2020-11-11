'use strict';

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

	function closeTextChat () {
		$('#wrtc_textChatWrapper .btn_leave').trigger('click');
	}

	function joinChatRoom(headerId, userInfo, target) {
		// textChat.userJoin(headerId, userInfo, 'TEXTPLUS');
		videoChat.userJoin(headerId, userInfo, 'PLUS');
		closeTextChat();
	}
	
	function leaveChatRoom(headerId, userInfo, target) {
		// textChat.userLeave(headerId, userInfo, 'TEXTPLUS');
		videoChat.userLeave(headerId, userInfo, 'PLUS');
		closeTextChat();
	}

	/**
  *
  * @param {string} actions @enum (JOIN|LEAVE)
  * @param {string} headerId
  * @param {string} target @enum (chatRoom|video|text)
  */
	function roomBtnHandler(actions, headerId, target) {
		if(typeof actions !== 'string') {
			actions.preventDefault();
			// actions.stopPropagation();
		}
		headerId = $(this).attr('data-id') || headerId;
		actions = $(this).attr('data-action') || actions;
		target = $(this).attr('data-join') || target;

		if (!headerId || !target ) return true;

		var $joinBtn = $(this);

		var userInfo = {
			padId: clientVars.padId || window.pad.getPadId(),
			userId: clientVars.userId || window.pad.getUserId(),
			userName: clientVars.userName || 'anonymous',
			headerId: headerId,
			target: target,
			action: actions
		};

		share.wrtcPubsub.emit('disable room buttons', headerId, actions, target);

		if (actions === 'JOIN') {
			switch (target) {
				case 'PLUS':
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
		} else if(actions === 'RELOAD') {
			videoChat.reloadSession(headerId, userInfo, target, actions);
		} else if(actions === 'SHARELINK') {
			shareRoomsLink(headerId, target);
		}
	}

	function joinByQueryString() {
		var urlParams = new URLSearchParams(window.location.search);
		var headerId = urlParams.get('id');
		var target = urlParams.get('target');
		var join = urlParams.get('join');

		if(!headerId) return true;

		var isHeading = share.$body_ace_outer().find('#' + headerId);

		if(!isHeading.length){
			$.gritter.add({
				title: 'Error',
				text: "The header seems not to exist anymore!",
				time: 3000,
				sticky: false,
				class_name: 'error'
			});
			return false;
		}

		if (headerId) {
			scroll2Header(headerId);
		}
		if (join === 'true') {
			target = target.toUpperCase();
			setTimeout(function makeSureHeadingReady() {
				roomBtnHandler('JOIN', headerId, target);
			}, 700);
		}
	}

	function shareRoomsLink(headId, target) {
		headId = $(this).attr('data-id') || headId;
		target = $(this).attr('data-join') || target;
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
		return offsetTop + height / 2 - 31;
	}

	function getHeaderRoomX($element) {
		var width = $element.outerWidth();
		var paddingLeft = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-left');
		var aceOuterPadding = parseInt(paddingLeft, 10);
		var offsetLeft = Math.ceil(share.$body_ace_outer().find('iframe[name="ace_inner"]').offset().left - aceOuterPadding);
		return offsetLeft - width - 6;
	}

	function activeEventListener() {
		var $wbrtc_roomBox = share.$body_ace_outer();

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_text', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_video', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_chatRoom', roomBtnHandler);

		$(document).on('click', '#chattext .wrtc_roomLink', roomBtnHandler);

		$(document).on('click', '#werc_toolbar .btn_roomHandler, .btn_controllers .btn_roomHandler', roomBtnHandler);

		// ep_full_hyperlinks link listner
		$wbrtc_roomBox.on('click', 'a.btn_roomHandler', roomBtnHandler)
		$(document).on('click', 'a.btn_roomHandler', roomBtnHandler)
		// share.$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function mouseenter() {
		// 	$(this).parent().css({ overflow: 'initial' });
		// 	$(this).addClass('active').find('.wrtc_contentBody').css({ display: 'block' });
		// }).on('mouseleave', '.wbrtc_roomBox', function mouseleave() {
		// 	$(this).parent().css({ overflow: 'hidden' });
		// 	$(this).removeClass('active').find('.wrtc_contentBody').css({ display: 'none' });
		// });

		share.$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function click() {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		// share.$body_ace_outer().on('mouseenter', '.wrtc_roomInlineAvatar .avatar', function mouseenter() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseenter');
		// }).on('mouseleave', '.wrtc_roomInlineAvatar .avatar', function mouseleave() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseleave');
		// });

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
		$(document).on('click', '#werc_toolbar .btn_videoSetting', function click() {
			var offset = $(this).position();
			var $box = $(document).find('#wrtc_settings');
			var width = $box.outerWidth();
			$box.css({left: offset.left - width  + 'px',top: offset.top + 4 + 'px'}).toggleClass('active');
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
			padId = docId;
			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
			share.wrtcPubsub.emit('component status', 'room', true)

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
			var components = share.wrtcStore.components;
			if(!components.text.active && !components.video.active && !components.room.active) return false;
			var hTagList = [];
			var hTagElements = hElements;
			var hTags = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody').children('div').children(hTagElements);
			var aceInnerOffset = share.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
			var target = share.$body_ace_outer().find('#outerdocbody');
			var newHTagAdded = false;

			$(hTags).each(function createWrtcRoomBox() {
				var $el = $(this);
				// var lineNumber = $el.parent().prevAll().length;
				// var tag = $("#title")[0].tagName.toLowerCase();
				var newY = getHeaderRoomY($el);
				var newX = Math.ceil(aceInnerOffset.left);
				var headingTagId = $el.find('span').attr('class');
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);

				if (!headingTagId) {
					console.warn("[wrtc]: couldn't find headingTagId.")
					return true;
				}

				var data = {
					headingTagId: headingTagId[1],
					// tag: tag,
					positionTop: newY,
					positionLeft: newX,
					headTitle: $el.text(),
					// lineNumber: lineNumber,
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
			// if a new h tag addedd check all heading again!
			if (newHTagAdded) {
				self.bulkUpdateRooms(hTagList);
				newHTagAdded = false;
			}
		}
	};

	return self;
})();
