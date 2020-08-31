'use strict';
var share = require('ep_wrtc_heading/static/js/clientShare');

var videoChat = (function videoChat() {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var localStream = null;
	var VIDEOCHATLIMIT = 0;
	var $joinBtn = null;

	function mediaDevices() {
		navigator.mediaDevices.enumerateDevices().then(function enumerateDevices(data) {
			var videoSettings = localStorage.getItem('videoSettings') || { video: null, audio: null };

			if (typeof videoSettings === 'string') {
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

	function stopStreaming(stream) {
		if (stream) {
			stream.getTracks().forEach(function stopStream(track) {
				track.stop();
			});
			stream = null;
		}
	}

	function isUserMediaAvailable() {
		return window.navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	}

	function activateModal() {}

	function deactivateModal() {}

	function removeUserFromRoom(data, roomInfo, cb) {
		if (!data || !roomInfo) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var $videoChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

		share.appendUserList(roomInfo, $videoChatUserList);

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		if (userCount === 0) {
			$videoChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_video" data-action="JOIN" data-id="' + headerId + '" data-join="VIDEO"><b>video-chat</b></button></li>');
		}

		var user = share.getUserFromId(data.userId);

		// notify, a user join the video-chat room
		var msg = {
			time: new Date(),
			userId: user.userId || data.userId,
			userName: user.name || data.name || 'anonymous',
			headerId: data.headerId,
			userCount: userCount,
			headerTitle: headerTitle,
			VIDEOCHATLIMIT: VIDEOCHATLIMIT
		};

		share.notifyNewUserJoined('VIDEO', msg, 'LEAVE');

		if (data.userId === clientVars.userId) {
			$headingRoom.removeAttr('data-video');
			share.roomBoxIconActive();
			WRTC.deactivate(data.userId, data.headerId);
			window.headerId = null;

			currentRoom = {};

			$('#wrtc_modal').css({
				transform: 'translate(-50%, -100%)',
				opacity: 0
			}).attr({ 'data-active': false });

			stopStreaming(localStream);
		}

		if (cb && typeof cb === 'function') cb();

		share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo, function updateStore() {});

		share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
	}

	function addUserToRoom(data, roomInfo) {
		if (!data) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// TODO: this is not good idea, use global state
		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		$(document).find('#wrtc_textChatWrapper .textChatToolbar .userCount').text(userCount);

		share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.videoChat ul'));

		// notify, a user join the video-chat room
		var msg = {
			time: new Date(),
			userId: data.userId,
			userName: user.name || data.name || 'anonymous',
			headerId: data.headerId,
			userCount: userCount,
			headerTitle: headerTitle,
			VIDEOCHATLIMIT: VIDEOCHATLIMIT
		};

		share.notifyNewUserJoined('VIDEO', msg, 'JOIN');

		if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
			$.gritter.add({
				text: '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerTitle + '"</b></i>',
				sticky: false,
				time: 3000,
				position: 'center',
				class_name: 'chat-gritter-msg'
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
				transform: 'translate(-50%, 0)',
				opacity: 1
			}).attr({ 'data-active': true });

			share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
		}

		share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'VIDEO', roomInfo, function updateStore() {});
	}

	function userJoin(headerId, userInfo, $joinButton) {
		if (!userInfo || !userInfo.userId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		// check if has user already in that room
		if (currentRoom && currentRoom.headerId === headerId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		$joinBtn = $joinButton;

		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

		isUserMediaAvailable().then(function joining(stream) {
			localStream = stream;

			if (!currentRoom.userId) {
				return socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
			}
			// If the user has already joined the video chat, make suer leave that room then join to the new chat room
			socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
				gateway_userLeave(_userData, roomInfo, function join2newOne() {
					socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
				});
			});
		})['catch'](function (err) {
			console.error(err);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
				gateway_userLeave(_userData, roomInfo);
			});
			WRTC.showUserMediaError(err);
		});
	}

	function userLeave(headerId, data, $joinButton) {
		$joinBtn = $joinButton;
		socket.emit('userLeave', padId, data, 'video', gateway_userLeave);
	}

	function reachedVideoRoomSize(roomInfo, showAlert, isBulkUpdate) {
		if (roomInfo && roomInfo.present <= VIDEOCHATLIMIT) return true;

		showAlert = showAlert || true;
		if (showAlert && !isBulkUpdate) {
			$.gritter.add({
				title: 'Video chat Limitation',
				text: 'The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is ' + VIDEOCHATLIMIT + '.',
				sticky: false,
				class_name: 'error',
				time: '5000'
			});
		}

		return false;
	}

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function makeRoomInfo(headerId) {
			var roomInfo = {
				present: rooms[headerId].length,
				list: rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
				gateway_userJoin(user, roomsInfo[headerId], true);
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