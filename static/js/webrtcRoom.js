'use strict';

var share = require("ep_wrtc_heading/static/js/clientShare");
var textChat = require("ep_wrtc_heading/static/js/textChat");

var WRTC_Room = function () {
	var self = null;
	var socket = null;
	var activeRooms = {
		'chatRoom': null,
		'video': null,
		'text': null
	}

	var currentUserRoom = {};
	var VIDEOCHATLIMIT = 0;
	// var $lastJoinButton = null;
	var prefixHeaderId = 'headingTagId_';
	var localStream = null;
	var hElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];

	/** --------- Helper --------- */

	function mediaDevices() {
		navigator.mediaDevices.enumerateDevices().then(function (data) {
			var videoSettings = localStorage.getItem('videoSettings') || {video: null, audio: null}
			
			if(typeof videoSettings === "string") {
				videoSettings = JSON.parse(videoSettings);
			}

			var audioInputSelect = document.querySelector('select#audioSource');
			var videoSelect = document.querySelector('select#videoSource');

			for (var i = 0; i !== data.length; ++i) {
				var deviceInfo = data[i];
				var option = document.createElement('option');
				option.value = deviceInfo.deviceId;
				if (deviceInfo.kind === 'audioinput') {
					option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
					if(videoSettings.audio === deviceInfo.deviceId)
						option.selected = true
					audioInputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'videoinput') {
					option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
					if(videoSettings.video === deviceInfo.deviceId)
						option.selected = true
					videoSelect.appendChild(option);
				}
			}
		});
	}

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

	function $body_ace_outer() {
		return $(document).find('iframe[name="ace_outer"]').contents();
	}

	function scroll2Header(headingId) {
		var padContainer = $body_ace_outer().find('iframe').contents().find('#innerdocbody');
		padContainer.find('.' + prefixHeaderId + headingId).each(function () {
			this.scrollIntoView({
				'behavior': 'smooth'
			});
		});
	}

	function isUserMediaAvailable() {
		return window.navigator.mediaDevices.getUserMedia({ 'audio': true, 'video': true })['catch'](function (err) {
			WRTC.showUserMediaError(err);
			console.error(err);
		});
	}

	function joinChatRoom() {

	}

	function leaveChatRoom() {
		
	}

	function joinTextChat(headId, userInfo) {
		textChat.userJoin(headId, userInfo)
	}

	function leaveTextChat(headId, userInfo) {
		textChat.userLeave(headId, userInfo)
	}

	function joinVideoChat() {

	}

	function leaveVideoChat() {

	}




	/**
	 * 
	 * @param {string} actions @enum (JOIN|LEAVE)
	 * @param {string} headerId 
	 * @param {string} target @enum (chatRoom|video|text)
	 */
	function roomBtnHandler(actions, headerId, target) {
		headerId = $(this).attr('data-headid') || headerId;
		actions = $(this).attr('data-action') || actions;

		var userInfo = {
			'padId': clientVars.padId,
			'userId': clientVars.userId,
			'userName': clientVars.userName || 'anonymous',
			'headingId': headerId,
			'target': target
		};

		if(actions === 'JOIN') {
			// Check if user does not already in current room 
			if(activeRooms[target] === userInfo.userId) return true;

			if(target === "chatRoom")	joinChatRoom(headId, userInfo)
			if(target === "video")		joinVideoChat(headId, userInfo)
			if(target === "text")			joinTextChat(headId, userInfo)
			
		} else if(actions === 'LEAVE') {
			if(target === "chatRoom") 	leaveChatRoom(headId, userInfo)
			if(target === "video") 			leaveVideoChat(headId, userInfo)
			if(target === "text")				leaveTextChat(headId, userInfo)
		}

		// check if user does not already in current video chat room
		// if (currentUserRoom && actions === 'JOIN' && currentUserRoom.headerId === headerId && currentUserRoom.userId === data.userId) return;

		// if (actions === 'JOIN') {
		// 	isUserMediaAvailable().then(function (stream) {
		// 		localStream = stream;
		// 		if (!currentUserRoom.userId) {
		// 			return socket.emit('userJoin', padId, data, gateway_userJoin);
		// 		}

		// 		// If the user has already joined the video chat, make suer leave that room then join to the new chat room
		// 		socket.emit('userLeave', padId, currentUserRoom, function (_data, roomInfo) {
		// 			gateway_userLeave(_data, roomInfo);
		// 			socket.emit('userJoin', padId, data, gateway_userJoin);
		// 		});
		// 	});
		// } else {
		// 	socket.emit('userLeave', padId, data, gateway_userLeave);
		// }
	}

	function createShareLink(headingTagId, headerText) {
		return window.location.origin + window.location.pathname + '?header=' + share.slugify(headerText) + '&headerId=' + headingTagId + '&joinvideo=true';
	}

	function joinByQueryString() {
		var urlParams = new URLSearchParams(window.location.search);
		var headingId = urlParams.get('headerId');
		var joinTarget = urlParams.get('text') || urlParams.get('video') || urlParams.get('chatRoom');
		if (headingId) {
			scroll2Header(headingId);
		}
		if (joinVideo === 'true') {
			// TODO: join link
			// roomBtnHandler('JOIN', headingId, joinTarget);
		}
	}

	function shareRoomsLink() {
		var headId = $(this).attr("data-id")
		var target = $(this).attr("data-join")
		var title = $body_ace_outer().find(".wbrtc_roomBox." + headId + " .titleRoom").text()
		
		var origin = window.location.origin
		var pathName = window.location.pathname
		var link = origin  + pathName + '?header=' + share.slugify(title) + '&headerId=' + headId + '&' + target + '=true';
		
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

	function activeEventListener() {

		$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_door', roomBtnHandler);

		$(document).on('click', '#werc_toolbar .btn_leave, .wrtc_text .wrtc_roomLink, #wrtc_textChatWrapper .btn_controllers .btn_leave', roomBtnHandler);


		$body_ace_outer().on('click', '.wbrtc_roomBox button.btn_shareRoom', shareRoomsLink);

		$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function () {
			$(this).addClass('active').find('.wrtc_contentBody, .wrtc_wrapper').css({ 'display': 'block' });
		}).on('mouseleave', '.wbrtc_roomBox', function () {
			$(this).removeClass('active').find('.wrtc_contentBody, .wrtc_wrapper').css({ 'display': 'none' });
		});

		$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function () {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		$(document).on('click', '#werc_toolbar p', function () {
			var headingId = $(this).attr('data-headid');
			scroll2Header(headingId);
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

	function getHeaderRoomY($element) {
		var height = $element.outerHeight();
		var paddingTop = $body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
		var aceOuterPadding = parseInt(paddingTop, 10);
		var offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
		return offsetTop + height / 2 - 14;
	}

	function addTextChatMessage(msg) {
		var authorClass = 'author-' + msg.userId.replace(/[^a-y0-9]/g, function (c) {
			if (c === '.') return '-';
			return 'z' + c.charCodeAt(0) + 'z';
		});

		// create the time string
		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var html = "<p data-headid='" + msg.headId + "' data-authorId='" + msg.userId + "' class='wrtc_text " + msg.headId + ' ' + authorClass + "'><b>" + msg.userName + "</b><span class='time " + authorClass + "'>" + timeStr + '</span> ' + msg.text + '</p>';

		$(document).find('#chatbox #chattext').append(html);
		share.scrollDownToLastChatText('#chatbox #chattext');
	}

	function stopStreaming(stream) {
		if (stream) {
			stream.getTracks().forEach(function (track) {
				track.stop();
			});
			stream = null;
		}
	}

	function socketBulkUpdateRooms(rooms) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function (headingId) {
			var roomInfo = {
				'present': rooms[headingId].length,
				'list': rooms[headingId]
			};
			roomsInfo[headingId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headingId) {
			rooms[headingId].forEach(function (user) {
				gateway_userJoin(user, roomsInfo[headingId], true);
			});
		});
	}

	function reachedVideoRoomSize(roomInfo, showAlert, isBulkUpdate) {
		if (roomInfo && roomInfo.present <= VIDEOCHATLIMIT) return true;

		showAlert = showAlert || true;
		if (showAlert && !isBulkUpdate) {
			$.gritter.add({
				'title': 'Video chat Limitation',
				'text': 'The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is ' + VIDEOCHATLIMIT + '.',
				'sticky': false,
				'class_name': 'error',
				'time': '5000'
			});
		}

		return false;
	}

	/**
  *
  * @param {Object} data @requires
  * @param {String} data.padId @requires
  * @param {String} data.userId @requires
  * @param {String} data.userName @requires
  * @param {String} data.headingId
  *
  * @param {Object} roomInfo
  * @param {Boolean} showAlert
  * @param {Boolean} bulkUpdate
 *
 *	@returns
  */
	function gateway_userJoin(data, roomInfo, showAlert, bulkUpdate) {
		if (!data) return reachedVideoRoomSize(null, true, false);

		if (data && reachedVideoRoomSize(roomInfo, showAlert, bulkUpdate)) {
			return self.addUserToRoom(data, roomInfo);
		} else if (bulkUpdate) {
			return self.addUserToRoom(data, roomInfo);
		}
		return stopStreaming(localStream);
	}

	function gateway_userLeave(data, roomInfo) {
		self.removeUserFromRoom(data, roomInfo);
	}


	self = {
		'aceSetAuthorStyle': function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = share.getUserFromId(context.author);
				if (user) {
					// sync user info
					// socket.emit('sync user info', window.pad.getPadId(), user, function(){})
					$body_ace_outer().find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
				}
			}
		},
		'userLeave': function userLeave(context, callback) {
			var userId = context.userInfo.userId;
			var headingId = $body_ace_outer().find(".wbrtc_roomBoxBody ul li[data-id='" + userId + "']").parent().parent().parent();
			var padId = window.pad.getPadId();
			var data = {
				'padId': padId,
				'userId': userId,
				'headingId': headingId.attr('id')
			};
			socket.emit('userLeave', padId, data, gateway_userLeave);
			callback();
		},
		'bulkUpdateRooms': function bulkUpdateRooms(hTagList) {
			var padId = window.pad.getPadId();
			socket.emit('bulkUpdateRooms', padId, hTagList, socketBulkUpdateRooms);
		},
		'initSocketJoin': function initSocketJoin() {
			var userId = window.pad.getUserId();
			var padId = window.pad.getPadId();
			socket.emit('join pad', padId, userId, function () {});
		},
		'postAceInit': function postAceInit(hook, context, webSocket) {
			socket = webSocket;
			this._pad = window.pad.getPadId();

			// join the user to WRTC room
			self.initSocketJoin();

			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

			socket.on('userJoin', function (data, roomInfo) {
				gateway_userJoin(data, roomInfo, false);
			});

			socket.on('userLeave', function (data, roomInfo) {
				gateway_userLeave(data, roomInfo);
			});

			activeEventListener();

			mediaDevices();

			// check if there is a join request in URI queryString
			setTimeout(function () {
				joinByQueryString();
			}, 500);
		},
		'removeUserFromRoom': function removeUserFromRoom(data, roomInfo) {
			if (!data) return false;
			var currentUserId = window.pad.getUserId();
			var $headingRoom = $body_ace_outer().contents();
			var $user = $headingRoom.find(".wbrtc_roomBoxBody ul li[data-id='" + data.userId + "']");
			$headingRoom = $user.closest('div').parent('.wbrtc_roomBox');

			$headingRoom.find('.wbrtc_roomBoxBody ul').empty();
			if (roomInfo.list) {
				roomInfo.list.forEach(function reOrderUserList(el) {
					var userInList = share.getUserFromId(el.userId);
					$headingRoom.find('.wbrtc_roomBoxBody ul').append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
				});
			}

			var userCount = roomInfo.present;
			$headingRoom.find('.userCount').text(userCount);
			$('#werc_toolbar .nd_title .nd_count,  #wrtc_textChatWrapper .userCount').text(userCount);

			// remove the text-chat notification
			$(".wrtc_text[data-authorid='" + data.userId + "'][data-headid='" + data.headingId + "']").remove();

			if (data.userId === currentUserId) {
				$headingRoom.find('span.videoIcon').removeClass('active');
				WRTC.deactivate(data.userId, data.headingId);
				window.headingId = null;
				currentUserRoom = {};
				$headingRoom.find('.wbrtc_roomBoxFooter button.btn_door').attr({
					'data-userId': data.userId,
					'data-action': 'JOIN',
					'disabled': false
				}).addClass('active').removeClass('deactivate').text('JOIN');
				$('#rtcbox .chatTitle').remove();

				$('#wrtc_modal').css({
					'transform': 'translate(-50%, -100%)',
					'opacity': 0
				}).attr({ 'data-active': false });

				stopStreaming(localStream);
				textChat.deactivateModal();
			}
		},
		'addUserToRoom': function addUserToRoom(data, roomInfo) {
			if (!data) return false;
			var currentUserId = window.pad.getUserId();
			var $headingRoom = $body_ace_outer().find('#' + data.headingId);
			var user = share.getUserFromId(data.userId);
			// some user may session does exist but the user info does not available in all over the current pad
			if (!user) return true;

			var headerText = $headingRoom.find('.wbrtc_roomBoxHeader b').text();
			var userCount = roomInfo.present;
			$headingRoom.find('.userCount').text(userCount);
			$('#werc_toolbar .nd_title .nd_count').text(userCount);
			$(document).find("#wrtc_textChatWrapper .textChatToolbar .userCount").text(userCount);

			// if incoming user has already in the room don't persuade the request
			var IsUserInRooms = $headingRoom.find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']").text();
			if (IsUserInRooms) return false;

			$headingRoom.find('.wbrtc_roomBoxBody ul').empty();

			if (roomInfo.list) {
				roomInfo.list.forEach(function reOrderUserList(el) {
					var userInList = share.getUserFromId(el.userId);
					$headingRoom.find('.wbrtc_roomBoxBody ul').append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
				});
			}

			var videoIcon = '<span class="videoIcon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-video fa-w-18 fa-2x"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" class=""></path></svg></span>';
			var roomCounter = "<span class='userCount'>(" + userCount + '/' + VIDEOCHATLIMIT + ')</span>';
			var btnJoin = "<span class='wrtc_roomLink' data-action='JOIN' data-headid='" + data.headingId + "' title='Join' data-url='" + createShareLink(data.headingId, headerText) + "'>" + headerText + '</span>';
			// notify, a user join the video-chat room
			var msg = {
				'time': new Date(),
				'userId': user.userId,
				'text': '<span>joins</span>' + videoIcon + btnJoin + roomCounter,
				'userName': user.name,
				'headId': data.headingId
			};
			addTextChatMessage(msg);

			if (data.headingId === currentUserRoom.headingId && data.userId !== currentUserId) {
				$.gritter.add({
					'text': '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerText + '"</b></i>',
					'sticky': false,
					'time': 3000,
					'position': 'bottom',
					'class_name': 'chat-gritter-msg'
				});
			}

			if (data.userId === currentUserId) {
				$('#werc_toolbar p').attr({ 'data-headid': data.headingId }).text(headerText);
				$('#werc_toolbar .btn_leave').attr({ 'data-headid': data.headingId });
				$headingRoom.find('span.videoIcon').addClass('active');
				window.headingId = data.headingId;
				WRTC.activate(data.headingId, user.userId);
				currentUserRoom = data;
				var $button = $headingRoom.find('.wbrtc_roomBoxFooter button.btn_door');
				$button.attr({
					'data-userId': user.userId,
					'data-action': 'LEAVE',
					'disabled': false
				}).removeClass('deactivate active').html('LEAVE');

				$('#rtcbox').prepend('<h4 class="chatTitle">' + headerText + '</h4>');

				$('#wrtc_modal').css({
					'transform': 'translate(-50%, 0)',
					'opacity': 1
				}).attr({ 'data-active': true });

				textChat.activateModal(data.headingId, headerText, userCount);
			}
		},
		'adoptHeaderYRoom': function adoptHeaderYRoom() {
			// Set all video_heading to be inline with their target REP
			var $padOuter = $body_ace_outer();
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
			var hTags = $body_ace_outer().find('iframe').contents().find('#innerdocbody').children('div').children(hTagElements);
			var aceInnerOffset = $body_ace_outer().find('iframe[name="ace_inner"]').offset();
			var target = $body_ace_outer().find('#outerdocbody');
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
					'url': createShareLink(headingTagId[1], linkText),
					'videoChatLimit': VIDEOCHATLIMIT
				};

				// if the header does not exists then adde to list
				// otherwise update textHeader
				if (target.find('#' + data.headingTagId).length <= 0) {
					var box = $('#wertc_roomBox').tmpl(data);
					target.find('#wbrtc_chatBox').append(box);
					newHTagAdded = true;
				} else {
					$(document).find('[data-headid=' + data.headingTagId + '].wrtc_text .wrtc_roomLink, #werc_toolbar p[data-headid=' + data.headingTagId + ']').text(data.headTitle);
					target.find('.wbrtc_roomBox[id=' + data.headingTagId + '] .wbrtc_roomBoxHeader b').text(data.headTitle);
					$(document).find('#wrtc_textChatWrapper[data-headid='+ data.headingTagId +'] .nd_title b').text(data.headTitle);
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
}();
