'use strict';

var videoChat = (function () {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var localStream = null;
	var VIDEOCHATLIMIT = 0;
	var $joinBtn = null;

	function mediaDevices() {
		navigator.mediaDevices.enumerateDevices().then(function (data) {
			var videoSettings = localStorage.getItem('videoSettings') || { video: null, audio: null };

			if (typeof videoSettings === "string") {
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
					if (videoSettings.audio === deviceInfo.deviceId) option.selected = true;
					audioInputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'videoinput') {
					option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
					if (videoSettings.video === deviceInfo.deviceId) option.selected = true;
					videoSelect.appendChild(option);
				}
			}
		});
	}

	function isUserMediaAvailable() {
		return window.navigator.mediaDevices.getUserMedia({ 'audio': true, 'video': true })['catch'](function (err) {
			WRTC.showUserMediaError(err);
			console.error(err);
		});
	}

	function activateModal() {}

	function deactivateModal() {}

	function removeUserFromRoom(data, roomInfo, cb) {
		if (!data || !roomInfo) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var $videoChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

		if (roomInfo.list) {
			$videoChatUserList.find('li').remove();
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$videoChatUserList.append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);
		$('#werc_toolbar .nd_title .nd_count').text(userCount);

		if (userCount === 0) {
			$videoChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_video" data-action="JOIN" data-id="' + headerId + '" data-join="video"><b>text-chat</b></button></li>');
		}

		// remove the text-chat notification
		$(".wrtc_text[data-target='video'][data-authorid='" + data.userId + "'][data-id='" + data.headerId + "']").remove();

		if (data.userId === clientVars.userId) {
			$headingRoom.removeAttr('data-video');
			share.roomBoxIconActive();
			WRTC.deactivate(data.userId, data.headerId);
			window.headerId = null;

			currentRoom = {};

			$('#wrtc_modal').css({
				'transform': 'translate(-50%, -100%)',
				'opacity': 0
			}).attr({ 'data-active': false });

			stopStreaming(localStream);
		}
		if (cb && typeof cb === 'function') cb();
	}

	function addUserToRoom(data, roomInfo) {
		if (!data) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		$('#werc_toolbar .nd_title .nd_count').text(userCount);

		$(document).find("#wrtc_textChatWrapper .textChatToolbar .userCount").text(userCount);

		var $vidoeChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

		if (roomInfo.list) {
			$vidoeChatUserList.find('li').remove();
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$vidoeChatUserList.append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		// notify, a user join the video-chat room
		var msg = {
			'time': new Date(),
			'userId': user.userId,
			'userName': user.name,
			'headerId': data.headerId,
			'userCount': userCount,
			'headerTitle': headerTitle,
			'VIDEOCHATLIMIT': VIDEOCHATLIMIT
		};

		share.notifyNewUserJoined("video", msg);

		if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
			$.gritter.add({
				'text': '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerTitle + '"</b></i>',
				'sticky': false,
				'time': 3000,
				'position': 'bottom',
				'class_name': 'chat-gritter-msg'
			});
		}

		if (data.userId === clientVars.userId) {

			$headingRoom.attr({ 'data-video': true });
			share.roomBoxIconActive();

			$('#werc_toolbar p').attr({ 'data-id': data.headerId }).text(headerTitle);
			$('#werc_toolbar .btn_leave').attr({ 'data-id': data.headerId });

			window.headerId = data.headerId;
			WRTC.activate(data.headerId, user.userId);
			currentRoom = data;

			$('#rtcbox').prepend('<h4 class="chatTitle">' + headerTitle + '</h4>');

			$('#wrtc_modal').css({
				'transform': 'translate(-50%, 0)',
				'opacity': 1
			}).attr({ 'data-active': true });

			if ($joinBtn && $joinBtn.length) $joinBtn.prop('disabled', false);
		}
	}

	function userJoin(headerId, data, $joinButton) {
		$joinBtn = $joinButton;
		$joinBtn.prop('disabled', true);
		// check if user already in that room
		if (currentRoom && currentRoom.headerId === headerId) {
			if ($joinBtn.length) $joinBtn.prop('disabled', false);
			return false;
		}

		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

		isUserMediaAvailable().then(function (stream) {
			localStream = stream;

			if (!currentRoom.userId) {
				return socket.emit('userJoin', padId, data, "video", gateway_userJoin);
			} else {
				// If the user has already joined the video chat, make suer leave that room then join to the new chat room
				socket.emit('userLeave', padId, currentRoom, "video", function (_data, roomInfo) {
					gateway_userLeave(_data, roomInfo, function () {
						socket.emit('userJoin', padId, data, "video", gateway_userJoin);
					});
				});
			}
		});
	}

	function userLeave(headerId, data) {
		socket.emit('userLeave', padId, data, 'video', gateway_userLeave);
	}

	function stopStreaming(stream) {
		if (stream) {
			stream.getTracks().forEach(function (track) {
				track.stop();
			});
			stream = null;
		}
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

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function (headerId) {
			var roomInfo = {
				'present': rooms[headerId].length,
				'list': rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
				videoChat.gateway_userJoin(user, roomsInfo[headerId], true);
			});
		});
	}

	function bulkUpdateRooms(hTagList) {
		socket.emit('bulkUpdateRooms', padId, hTagList, 'video', socketBulkUpdateRooms);
	}

	/**
  *
  * @param {Object} data @requires
  * @param {String} data.padId @requires
  * @param {String} data.userId @requires
  * @param {String} data.userName @requires
  * @param {String} data.headerId
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
			return addUserToRoom(data, roomInfo);
		} else if (bulkUpdate) {
			return addUserToRoom(data, roomInfo);
		}
		return stopStreaming(localStream);
	}

	function gateway_userLeave(data, roomInfo, cb) {
		removeUserFromRoom(data, roomInfo, cb);
	}

	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId || window.pad.getPadId();
		VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

		mediaDevices();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave,
		gateway_userJoin: gateway_userJoin,
		gateway_userLeave: gateway_userLeave,
		bulkUpdateRooms: bulkUpdateRooms
	};
})();

module.exports = videoChat;