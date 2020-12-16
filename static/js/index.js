'use strict';

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

/** **********************************************************************/
/*                              Plugin                                  */
/** **********************************************************************/

var EPwrtcHeading = (function EPwrtcHeading() {
  let padOuter = null;
  let padInner = null;
  let outerBody = null;

  function enableWrtcHeading() {
    padOuter.find('#wbrtc_chatBox').addClass('active');
    $('#rtcbox').addClass('active');
  }

  function disableWrtcHeading() {
    padOuter.find('#wbrtc_chatBox').removeClass('active');
    $('#rtcbox').removeClass('active');
    // TODO: fully disable plugin
    // WRTC_Room.hangupAll();
  }

  function init(ace, padId, userId) {
    const loc = document.location;
    const port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
    const url = `${loc.protocol}//${loc.hostname}:${port}/` + 'heading_chat_room';
    const socket = io.connect(url, {
      reconnectionAttempts: 9,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 6000,
    });

    // reason (String) either ‘io server disconnect’, ‘io client disconnect’, or ‘ping timeout’
    socket.on('disconnect', (reason) => {
      console.error('[wrtc]: socket disconnection, reason:', reason);
      share.wrtcPubsub.emit('socket state', 'DISCONNECTED');
      // $.gritter.add({
      // 	title: 'Video socket connection has been disconnected',
      // 	text: 'Plase use stable internet connection, open up your console for more information; reason:' + reason,
      // 	sticky: false,
      // 	class_name: 'error',
      // 	time: '300'
      // });
    });

    // unfortunately when reconnection happen, etherpad break down totally
    // share.wrtcPubsub.emit('socket state', 'OPEND');
    socket.on('connect', () => {
      share.wrtcPubsub.emit('socket state', 'OPEND');
      console.info('[wrtc]: socket connect', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('[wrtc]: socket connect_error:', error);
      share.wrtcPubsub.emit('socket state', 'DISCONNECTED');
    });

    socket.emit('join pad', padId, userId, () => {});

    // find containers
    padOuter = $('iframe[name="ace_outer"]').contents();
    padInner = padOuter.find('iframe[name="ace_inner"]');
    outerBody = padOuter.find('#outerdocbody');

    // insert wbrtc containers
    const $target = outerBody;
    if ($target.find('#wbrtc_chatBox').length) return false;
    $target.prepend('<div id="wbrtc_chatBox"></div><div id="wbrtc_avatarCol"></div>');

    // module settings
    $('#options-wrtc-heading').on('change', () => {
      $('#options-wrtc-heading').is(':checked') ? enableWrtcHeading() : disableWrtcHeading();
    });

    $('#options-wrtc-heading').trigger('change');

    if (browser.chrome || browser.firefox) {
      padInner.contents().on('copy', (e) => {
        events.addTextOnClipboard(e, ace, padInner, false);
      });

      padInner.contents().on('cut', (e) => {
        events.addTextOnClipboard(e, ace, padInner, true);
      });

      padInner.contents().on('paste', (event) => {
        events.pastOnSelection(event, padInner);
      });
    }

    window.onerror = function (message, source, lineno, colno, error) {
      console.error('[wrtc]: windows error, close stream');
      if (window.headerId) WRTC.deactivate(clientVars.userId, window.headerId);
    };

    return socket;
  }

  return Object.freeze({
    init,
  });
})();

/** **********************************************************************/
/*                           Etherpad Hooks                             */
/** **********************************************************************/

function getSocket() {
  return window.pad && window.pad.socket;
}

var hooks = {
  postAceInit: function postAceInit(hook, context) {
    if (!$('#editorcontainerbox').hasClass('flex-layout')) {
      $.gritter.add({
        title: 'Error',
        text: 'ep_wrtc_heading: Please upgrade to etherpad 1.8.3 for this plugin to work correctly',
        sticky: true,
        class_name: 'error',
      });
    }

    // Bridge into the ep_profiles
    window.clientVars.ep_profile_list = {};
    getSocket().on('message', (obj) => {
      if (obj.type === 'COLLABROOM' && obj.data && obj.data.type === 'CUSTOM') {
        const data = obj.data.payload;
        if (data.action === 'EP_PROFILE_USERS_LIST') {
          data.list.forEach((el) => {
            if (!window.clientVars.ep_profile_list[el.userId]) window.clientVars.ep_profile_list[el.userId] = {};
            window.clientVars.ep_profile_list[el.userId] = el;
          });
        }
        if (data.action === 'EP_PROFILE_USER_LOGIN_UPDATE') {
          window.clientVars.ep_profile_list[data.userId] = data;
          if (share && share.wrtcPubsub) {
            share.wrtcPubsub.emit('update inlineAvater info', data.userId, data, () => {});
          }
        }
      }
    });

    const ace = context.ace;
    const userId = window.pad.getUserId() || clientVars.padId;
    const padId = window.pad.getPadId() || clientVars.userId;

    // TODO: make sure the priority of these components are in line
    // TODO: make sure clientVars contain all data that's necessary

    if (!clientVars.userId || !clientVars.padId) throw new Error("[wrtc]: clientVars doesn't exists");

    const socket = EPwrtcHeading.init(ace, padId, userId);
    WRTC.postAceInit(hook, context, socket, padId);
    videoChat.postAceInit(hook, context, socket, padId);
    textChat.postAceInit(hook, context, socket, padId);
    WRTC_Room.postAceInit(hook, context, socket, padId);

    $('#editorcontainer iframe').ready(() => {
      WRTC.appendInterfaceLayout();
      setTimeout(() => {
        WRTC_Room.findTags();
      }, 250);
    });

    $(window).resize(_.debounce(() => {
      WRTC_Room.adoptHeaderYRoom();
    }, 100));
  },
  aceEditEvent: function aceEditEvent(hook, context) {
    const eventType = context.callstack.editEvent.eventType;
    // ignore these types
    if ('handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps'.includes(eventType)) return;
    // some times init ep_wrtc_heading is not yet in the plugin list
    if (context.callstack.docTextChanged) WRTC_Room.adoptHeaderYRoom();

    // apply changes to the other user
    if (eventType === 'applyChangesToBase' && context.callstack.selectionAffected) {
      setTimeout(() => {
        WRTC_Room.findTags();
      }, 250);
    }
  },
  aceAttribsToClasses: function aceAttribsToClasses(hook, context) {
    if (context.key === 'headingTagId') {
      return [`headingTagId_${context.value}`];
    }
  },
  aceEditorCSS: function aceEditorCSS() {
    const version = clientVars.webrtc.version || 1;
    return [`ep_wrtc_heading/static/css/wrtcRoom.css?v=${version}`];
  },
  aceSetAuthorStyle: function aceSetAuthorStyle(hook, context) {
    WRTC_Room.aceSetAuthorStyle(context);
    WRTC.aceSetAuthorStyle(context);
  },
  userLeave: function userLeave(hook, context, callback) {
    WRTC_Room.userLeave(context, callback);
    WRTC.userLeave(null, context, callback);
  },
  handleClientMessage_RTC_MESSAGE: function handleClientMessage_RTC_MESSAGE(hook, context) {
    WRTC.handleClientMessage_RTC_MESSAGE(hook, context);
  },
  aceSelectionChanged: function aceSelectionChanged(rep, context) {
    if (context.callstack.type === 'insertheading') {
      rep = context.rep;
      context.documentAttributeManager.setAttributeOnLine(rep.selStart[0], 'headingTagId', randomString(16));
    }
  },
  aceInitialized: function aceInitialized(hook, context) {
    const editorInfo = context.editorInfo;
    editorInfo.ace_hasHeaderOnSelection = _(events.hasHeaderOnSelection).bind(context);
  },
  chatNewMessage: function chatNewMessage(hook, context, callback) {
    let text = context.text;
    // If the incoming message is a link and the link has the title attribute wrtc
    if (text.indexOf('href=') > 0) {
      text = $(text);
      const href = text.attr('href');
      const currentPath = location.origin + location.pathname;
      // If the link is belong to this header
      if (href.indexOf(currentPath) === 0) {
        const urlParams = new URLSearchParams(href);
        const headerId = urlParams.get('id');
        const target = urlParams.get('target');
        if (headerId) {
          text = text.attr({
            'data-join': target,
            'data-action': 'JOIN',
            'data-id': headerId,
          }).addClass('btn_roomHandler');
          context.text = jQuery('<div />').append(text.eq(0).clone()).html();
        }
      }
    }
    callback(context);
  },
};

exports.postAceInit = hooks.postAceInit;
exports.aceEditorCSS = hooks.aceEditorCSS;
exports.aceAttribsToClasses = hooks.aceAttribsToClasses;
exports.aceEditEvent = hooks.aceEditEvent;
exports.aceSetAuthorStyle = hooks.aceSetAuthorStyle;
exports.userLeave = hooks.userLeave;
exports.handleClientMessage_RTC_MESSAGE = hooks.handleClientMessage_RTC_MESSAGE;
exports.aceSelectionChanged = hooks.aceSelectionChanged;
exports.aceInitialized = hooks.aceInitialized;
exports.chatNewMessage = hooks.chatNewMessage;
exports.aceDomLineProcessLineAttributes = function (name, context) {
  const cls = context.cls;
  const videoHEaderType = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(cls);
  const headingType = /(?:^| )heading:([A-Za-z0-9]*)/.exec(cls);
  const result = [];
  if (videoHEaderType && headingType) {
    const modifier = {
      preHtml: `<nd-video class="videoHeader ${videoHEaderType[1]}">`,
      postHtml: '</nd-video>',
      processedMarker: true,
    };
    result.push(modifier);
    setTimeout(() => {
      WRTC_Room.findTags();
    }, 500);
  }
  return result;
};
