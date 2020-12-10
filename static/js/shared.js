'use strict';
var _ = require('ep_etherpad-lite/static/js/underscore');
var tags = ['nd-video'];

var collectContentPre = function collectContentPre(hook, context) {
  const tname = context.tname;
  const state = context.state;
  const lineAttributes = state.lineAttributes;
  const tagIndex = _.indexOf(tags, tname);
  if (tagIndex >= 0) {
    lineAttributes.headingTagId = context.cls.split(' ')[1];
    _.debounce(() => {
      WRTC_Room.findTags(context);
    }, 100)();
  }
};

exports.collectContentPre = collectContentPre;
