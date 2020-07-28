"use strict";

module.exports.scrollDownToLastChatText = function scrollDownToLastChatText(selector, force){
	$(selector).animate({ 'scrollTop': $(selector)[0].scrollHeight }, { 'duration': 400, 'queue': false });
}