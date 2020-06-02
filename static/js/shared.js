var randomString = require("ep_etherpad-lite/static/js/pad_utils").randomString
var tags = ["h1", "h2", "h3", "h4", "code"]

var collectContentPre = function (hook, context) {
	var tname = context.tname
	var tagIndex = tags.indexOf(tname)
	if (tagIndex >= 0) {
		var headingTagId = randomString(16)
		// when copy header form clipboard, trige headingTagId to set
		context.cc.doAttrib(context.state, "headingTagId::" + headingTagId)
		setTimeout(function () {
			WRTC_Room.findTags()
		}, 250)
	}
}

exports.collectContentPre = collectContentPre
