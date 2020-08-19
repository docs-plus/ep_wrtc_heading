"use strict";

var avatarUrl = "../static/plugins/ep_profile_modal/static/img/user.png";

exports.scrollDownToLastChatText = function scrollDownToLastChatText(selector) {
	var $element = $(selector)[0];
	if (!selector && $element.length) return true;
	$element.animate({ 'scrollTop': $element.scrollHeight }, { 'duration': 400, 'queue': false });
};

exports.getUserFromId = function getUserFromId(userId) {
	if (!window.pad || !window.pad.collabClient) return null;
	var result = window.pad.collabClient.getConnectedUsers().filter(function (user) {
		return user.userId === userId;
	});
	var user = result.length > 0 ? result[0] : null;
	return user;
};

exports.slugify = function slugify(text) {
	return text.toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
	.replace(/&/g, '-and-') // Replace & with 'and'
	.replace(/[^\w\-]+/g, '') // Remove all non-word chars
	.replace(/\--+/g, '-') // Replace multiple - with single -
	.replace(/^-+/, '') // Trim - from start of text
	.replace(/-+$/, ''); // Trim - from end of text
};

exports.$body_ace_outer = function $body_ace_outer() {
	return $(document).find('iframe[name="ace_outer"]').contents();
};

exports.createShareLink = function createShareLink(headingTagId, headerText) {
	return window.location.origin + window.location.pathname + '?header=' + exports.slugify(headerText) + '&headerId=' + headingTagId + '&joinvideo=true';
};

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

	var html = "<p data-target='" + msg.target + "' data-id='" + msg.headerId + "' data-authorId='" + msg.userId + "' class='wrtc_text " + msg.headId + ' ' + authorClass + "'><b>" + msg.userName + "</b><span class='time " + authorClass + "'>" + timeStr + '</span> ' + msg.text + '</p>';

	$(document).find('#chatbox #chattext').append(html);
	exports.scrollDownToLastChatText('#chatbox #chattext');
}

exports.notifyNewUserJoined = function notifyNewUserJoined(target, msg) {

	var videoIcon = '<span class="videoIcon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-video fa-w-18 fa-2x"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" class=""></path></svg></span>';
	var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
	var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';

	if (target === 'video') {
		var roomCounter = "<span class='userCount'>(" + msg.userCount + '/' + msg.VIDEOCHATLIMIT + ')</span>';
		msg.text = '<span>joins</span>' + videoIcon + btnJoin + roomCounter;
	} else if (target === 'text') {
		msg.text = '<span>joins</span>' + textIcon + btnJoin;
	}

	msg.target = target;

	addTextChatMessage(msg);
};

exports.toggleRoomBtnHandler = function toggleRoomBtnHandler($joinLeaveBtn, action) {
	// var join = $joinLeaveBtn.attr("data-join");
	// var headerId = $joinLeaveBtn.attr("data-id");
	// var $btnText = exports.$body_ace_outer().find(".wbrtc_roomBox." + headerId + " [data-join='text']")
	// var $btnVideo = exports.$body_ace_outer().find(".wbrtc_roomBox." + headerId + " [data-join='video']")

	// $joinLeaveBtn.attr({"data-action": action});

	// if(join === "chatRoom"){
	// 	$btnVideo.prop('disabled', false)
	// 	$btnText.prop('disabled', false)
	// 	$btnText.attr({"data-action": action});
	// 	$btnVideo.attr({"data-action": action});
	// } else {
	// 	if($btnText.attr("data-action") === "LEAVE" || $btnVideo.attr("data-action") === "LEAVE") {
	// 		exports.$body_ace_outer().find(".wbrtc_roomBox." + headerId + " [data-join='chatRoom']").attr({"data-action": "LEAVE"});
	// 	}else {
	// 		exports.$body_ace_outer().find(".wbrtc_roomBox." + headerId + " [data-join='chatRoom']").attr({"data-action": "JOIN"});
	// 	}
	// }
}

exports.roomBoxIconActive = function roomBoxIconActive() {
	exports.$body_ace_outer().find(".wbrtc_roomBox").each(function (index, val) {
		var textActive = $(val).attr("data-text");
		var videoActive = $(val).attr("data-video");
		if (textActive || videoActive) {
			$(val).find('.btn_joinChat_chatRoom').addClass("active");
		} else {
			$(val).find('.btn_joinChat_chatRoom').removeClass("active");
		}
	});
};

exports.appendUserList = function appendUserList(roomInfo, selector) {
	if (!roomInfo.list) return true;
	var $element = typeof(selector) === "string" ? $(document).find(selector) : selector;
	$element.find('li').remove();
	roomInfo.list.forEach(function reOrderUserList(el) {
		var userInList = share.getUserFromId(el.userId);
		if(clientVars.ep_profile_list && clientVars.ep_profile_list[userInList.userId]){
			avatarUrl = clientVars.ep_profile_list[userInList.userId].imageUrl || clientVars.ep_profile_list[userInList.userId].img;
		} 
		$element.append('<li data-id=' + userInList.userId + " style='border-color: " + userInList.colorId + "'><div class='avatar'><img src='" + avatarUrl + "'></div>" + userInList.name + '</li>');
	});
	
}

exports.appendInlineAvatar = function appendInlineAvatar(roomInfo, selector) {
	if (!roomInfo.list) return true;
	var $element = typeof(selector) === "string" ? $(document).find(selector) : selector;
	$element.find('.avatar').remove();
	roomInfo.list.forEach(function reOrderUserList(el) {
		var userInList = share.getUserFromId(el.userId);
		if(clientVars.ep_profile_list && clientVars.ep_profile_list[userInList.userId]){
			avatarUrl = clientVars.ep_profile_list[userInList.userId].imageUrl || clientVars.ep_profile_list[userInList.userId].img;
		} 
		$element.append('<div class="avatar" data-id="' + userInList.userId + '"><img src="' + avatarUrl + '"><div class="name">' + userInList.name + '</div></div>');
	});
}
