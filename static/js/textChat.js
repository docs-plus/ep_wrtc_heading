'use strict';

var textChat = (function () {
	var socket = null;
	var padId = null;
	var currentRoom = {};

	function createAndAppendMessage(msg) {
		if (!msg) return true;

		//correct the time
		// msg.time += window.clientTimeOffset;

		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var userName = $('<b>').text(msg.userName + ": ");
		var tim = $("<span>").attr({ "class": "time" }).text(timeStr);

		var message = $("<p>").attr({
			"data-authorid": msg.author
		}).append(userName).append(tim).append(msg.text);

		$("#wrtc_textChat").append(message);
		share.scrollDownToLastChatText("#wrtc_textChat");
	}

	function eventTextChatInput(e) {
		var keycode = event.keyCode || event.which;
		// when press Enter key
		if (keycode === 13) {
			var textMessage = $(this).val();
			if (!textMessage) return true;
			$(this).val('');
			var user = share.getUserFromId(clientVars.userId);
			var msg = { text: textMessage, userName: user.name, author: user.userId, time: new Date().getTime() };

			socket.emit("sendTextMessage", padId, currentRoom.headerId, msg, function (msg) {
				createAndAppendMessage(msg);
			});
		}
	}

	function eventListers() {
		$(document).on("keypress", "#wrtc_textChatInputBox input", eventTextChatInput);
	}

	function deactivateModal(headerId) {
		var $TextChatWrapper = $(document).find("#wrtc_textChatWrapper");
		$TextChatWrapper.removeClass('active');

		$TextChatWrapper.find("#wrtc_textChat p").remove();

		socket.removeListener('receiveTextMessage:' + headerId);
	}

	function activateModal(headerId, headTitle, userCount) {
		if (!headerId) return false;
		var existTextChat = $(document).find("#wrtc_textChatWrapper")
		
		if(!existTextChat.length){
			var textChatBox = $('#wrtc_textChatBox').tmpl({
				headId: headerId,
				headTitle: headTitle,
				userCount: userCount
			});
			$('body').append(textChatBox);
		} else {
			// TODO: change this to template
			existTextChat.attr({"data-id": headerId}).find(".btn_leave").attr({"data-id": headerId})
			existTextChat.find(".nd_title b").text(headTitle)
			existTextChat.find(".userCount").text(userCount)
		}


		// for animation pop up
		setTimeout(function () {
			$(document).find("#wrtc_textChatWrapper").addClass("active");
		}, 250);

		socket.on("receiveTextMessage:" + headerId, function (headingId, msg) {
			if (headingId === headerId) {
				createAndAppendMessage(msg);
			}
		});

		socket.emit("getTextMessages", padId, headerId, {}, function (data) {
			data.forEach(function (el) {
				createAndAppendMessage(el);
			});
		});

		eventListers();
	}

	function addUserToRoom(data, roomInfo) {
		if(!data) return true;
		var headerId = data.headerId
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul')

		if (roomInfo.list) {
			$textChatUserList.find('li').remove()
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$textChatUserList.append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		if (data.userId === clientVars.userId) {
			currentRoom = data
			activateModal(headerId, headTitle, userCount)
		}
	}

	function removeUserFromRoom(data, roomInfo, target , cb) {
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);

		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul')

		if (roomInfo.list) {
			$textChatUserList.find('li').remove()
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$textChatUserList.append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		if(userCount === 0){
			$textChatUserList.append('<li class="empty">Be the first to join the <b class="btn_joinChat_text" data-action="JOIN" data-id="' + headerId + '" data-join="text">text-chat</b></li>');
		}
		if (data.userId === clientVars.userId) {
			currentRoom = {}
			deactivateModal(data.headId);
		}
		if(cb && typeof cb === 'function') cb();
	}

	function userJoin(headerId, userData) {

		// check if user already in that room
		if (currentRoom && currentRoom.headerId === headerId && currentRoom.userId === userData.userId) return false;
		
		if(!currentRoom.userId){
			socket.emit('userJoin', padId, userData, "text", addUserToRoom);
		} else {
			socket.emit('userLeave', padId, currentRoom, "text", function (data, roomInfo, target) {
				removeUserFromRoom(data, roomInfo, "text", function(){
					socket.emit('userJoin', padId, userData, "text", addUserToRoom);
				})
			});
		}
	}

	function userLeave(headerId, userData) {
		socket.emit('userLeave', padId, userData, "text", removeUserFromRoom);
	}

	function socketBulkUpdateRooms(rooms) {
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
				textChat.addUserToRoom(user, roomsInfo[headerId], 'text')
			});
		});
	}

	function bulkUpdateRooms(hTagList) {
		socket.emit('bulkUpdateRooms', padId, hTagList, 'text', socketBulkUpdateRooms);
	}

	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId || window.pad.getPadId();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave,
		removeUserFromRoom: removeUserFromRoom,
		addUserToRoom: addUserToRoom,
		bulkUpdateRooms: bulkUpdateRooms
	};
})();

module.exports = textChat;