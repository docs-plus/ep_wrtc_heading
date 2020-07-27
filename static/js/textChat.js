'use strict';

var textChat = (function (){
	var socket = null



	function eventTextChatInput (e) {
		var keycode = event.keyCode || event.which

		// when press Enter key
		if(keycode === 13) {
			var textMessage = $(this).val()

			console.log("click the text input", textMessage)


			// create the time string
			var minutes = '' + new Date().getMinutes();
			var hours = '' + new Date().getHours();
			if (minutes.length === 1) minutes = '0' + minutes;
			if (hours.length === 1) hours = '0' + hours;
			var timeStr = hours + ':' + minutes;

			var userName = $('<b>').text(clientVars.userName + ":")
			var tim = $("<span>").attr({"class": "time"}).text(timeStr)

			var message = $("<p>").attr({
				"data-authorid": clientVars.userId,
			}).append(userName).append(tim).append(textMessage)

			$(this).val('')
			$("#wrtc_textChat").append(message)
		}
	}

	function eventLister () {
		$(document).on("keypress", "#wrtc_textChatInputBox input", eventTextChatInput)
	}


	function postAceInit(hook, context, webSocket){
		socket = webSocket
		console.log("init textChat")
		var textChatBox = $('#wrtc_textChatBox').tmpl();
		$('body').append(textChatBox)
		eventLister()
	}


	return {
		postAceInit: postAceInit
	}
})();

module.exports = {
	postAceInit: textChat.postAceInit
}