"use strict";

exports.scrollDownToLastChatText = function scrollDownToLastChatText(selector) {
	if (!selector) return true;
	$(selector).animate({ 'scrollTop': $(selector)[0].scrollHeight }, { 'duration': 400, 'queue': false });
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