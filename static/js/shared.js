'use strict';
const _ = require('ep_etherpad-lite/static/js/underscore');
const tags = ['nd-video'];
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

const collectContentPre = (hook, context) => {
  const tname = context.tname;
  const state = context.state;
  const lineAttributes = state.lineAttributes;
  const tagIndex = _.indexOf(tags, tname);
  if (tname === 'div' || tname === 'p') {
    delete lineAttributes.headingTagId;
  }
  if (tagIndex >= 0) {
    const headerId = context.cls.split(' ')[1];
    const $header = share.$body_ace_outer().find('iframe')
        .contents()
        .find('#innerdocbody')
        .children('div')
        .find(`.videoHeader.${headerId}`);

    // If there is a header, just move the headerId, otherwise create a new headerId
    if ($header.length === 0) {
      lineAttributes.headingTagId = headerId;
    } else {
      lineAttributes.headingTagId = randomString(16);
    }
  }
};

exports.collectContentPre = collectContentPre;
