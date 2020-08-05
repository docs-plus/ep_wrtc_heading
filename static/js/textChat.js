'use strict';

var textChat = function () {
	var socket = null;
	var padId = null;
	var VIDEOCHATLIMIT = 4;

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

			socket.emit("sendTextMessage", padId, headId, msg, function (msg) {
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

		headerId = null;
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
			existTextChat.attr({"data-headid": headerId}).find(".btn_leave").attr({"data-headid": headerId})
			existTextChat.find(".nd_title b").text(headTitle)
			existTextChat.find(".userCount").text(userCount)
		}


		// for animation pop up
		setTimeout(function () {
			existTextChat.addClass("active");
		}, 250);

		socket.on("receiveTextMessage:" + headId, function (headingId, msg) {
			if (headingId === headId) {
				createAndAppendMessage(msg);
			}
		});

		socket.emit("getTextMessages", padId, headId, {}, function (data) {
			data.forEach(function (el) {
				createAndAppendMessage(el);
			});
		});

		eventListers();
	}

	function addUserToRoom(data, roomInfo) {
		var headerId = data.headId
		var $headingRoom = $body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		if (roomInfo.list) {
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$headingRoom.find('.wrtc_content.textChat ul').append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		activateModal(headerId, headTitle, userCount)
	}

	function removeUserFromRoom(data, roomInfo) {
		var headerId = data.headId
		var $headingRoom = $body_ace_outer().find('#' + headerId);

		if (roomInfo.list) {
			roomInfo.list.forEach(function reOrderUserList(el) {
				var userInList = share.getUserFromId(el.userId);
				$headingRoom.find('.wrtc_content.textChat ul').append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'>" + userInList.name + '</li>');
			});
		}

		deactivateModal(data.headId)
	}

	function userJoin(headId, userData) {
		socket.emit('userJoin', padId, userData, "text", addUserToRoom);
	}

	function userLeave(headId, userData) {
		socket.emit('userLeave', padId, userData, "text", removeUserFromRoom);
	}

	function postAceInit(hook, context, webSocket) {
		socket = webSocket;
		VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
		padId = window.pad.getPadId();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave
	};
}();

module.exports = textChat;