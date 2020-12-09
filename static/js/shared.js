'use strict';
var _ = require('ep_etherpad-lite/static/js/underscore');
var tags = ['nd-video'];

var collectContentPre = function collectContentPre(hook, context) {
  var tname = context.tname;
  var state = context.state;
	var lineAttributes = state.lineAttributes
	var tagIndex = _.indexOf(tags, tname);
  if(tagIndex >= 0){
		lineAttributes['headingTagId'] = context.cls.split(" ")[1];
		_.debounce(function() {
      WRTC_Room.findTags(context);
    }, 100)()
  }
};

exports.collectContentPre = collectContentPre;
