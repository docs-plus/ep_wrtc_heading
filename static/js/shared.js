'use strict';

var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

var tags = ['h1', 'h2', 'h3', 'h4'];

var collectContentPre = function collectContentPre(hook, context) {
	var tname = context.tname;
	var tagIndex = tags.indexOf(tname);
	var existTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(context.cls);

	if (existTagId && existTagId[1]) {
		context.cc.doAttrib(context.state, 'headingTagId::' + existTagId[1]);
	}

	// if the requests are from H tags
	if (tagIndex >= 0) {
		context.state.lineAttributes.heading = tags[tagIndex];
		var jsx = /(?:^| )jsx-([A-Za-z0-9]*)/.exec(context.cls);

		// when copy header form clipboard, call headingTagId to set
		if (context.styl && context.styl.length > 10 || jsx && jsx[1]) {
			context.cc.doAttrib(context.state, 'headingTagId::' + randomString(16));
		}

		setTimeout(function setTimeout() {
			WRTC_Room.findTags(context);
		}, 250);
	}
};

exports.collectContentPre = collectContentPre;
