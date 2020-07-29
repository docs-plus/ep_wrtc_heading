'use strict';


var textChat = (function (){
	var socket = null
	var padId = null

	function createAndAppendMessage (msg) {
		if(!msg) return true;

		//correct the time
		// msg.time += window.clientTimeOffset;

		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var userName = $('<b>').text(msg.userName + ": ")
		var tim = $("<span>").attr({"class": "time"}).text(timeStr)

		var message = $("<p>").attr({
			"data-authorid": msg.author,
		}).append(userName).append(tim).append(msg.text)

		$("#wrtc_textChat").append(message)
		share.scrollDownToLastChatText("#wrtc_textChat")
	}

	function eventTextChatInput (e) {
		var keycode = event.keyCode || event.which
		// when press Enter key
		if(keycode === 13) {
			var textMessage = $(this).val()
			$(this).val('')
			var user = share.getUserFromId(clientVars.userId)
			var msg = {text: textMessage, userName: user.name,  author: user.userId, time: new Date().getTime()} 

			socket.emit("sendTextMessage", padId, "headId", msg, function(msg){
				createAndAppendMessage(msg)
			})
		}
	}

	function eventLister () {
		$(document).on("keypress", "#wrtc_textChatInputBox input", eventTextChatInput)
	}

	function postAceInit(hook, context, webSocket){
		socket = webSocket
		padId = window.pad.getPadId()
		console.log("init textChat")
		var textChatBox = $('#wrtc_textChatBox').tmpl();
		$('body').append(textChatBox)
		eventLister()

		socket.on("receiveTextMessage", function(msg) {
			console.log("get message")
			createAndAppendMessage(msg)
		})

		socket.emit("getTextMessages", padId, "headId" , {} ,  function(data){
			data.forEach(function(el) {
				createAndAppendMessage(el)
			});
		})


	}


	return {
		postAceInit: postAceInit
	}
})();

module.exports = {
	postAceInit: textChat.postAceInit
}
