'use strict';

const _ = require('underscore');
let ioClient = require('ep_wrtc_heading/static/js/socketIoMin');

const EPwrtcHeading = (() => {
  let padOuter;
  let padInner;
  let outerBody;

  const enableWrtcHeading = () => {
    Helper.wrtcPubsub.emit('plugin enable', true);
  };

  const disableWrtcHeading = () => {
    Helper.wrtcPubsub.emit('plugin enable', false);
  };

  const init = (ace, padId, userId) => {
    const loc = document.location;
    const port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
    let socketURL = clientVars.webrtc.socketRemoteAddress;

    if (clientVars.webrtc.useEtherpadSocket || loc.hostname === 'localhost') {
      ioClient = io;
      socketURL = `${loc.protocol}//${loc.hostname}:${port}`;
    }

    socketURL = `${socketURL}/${clientVars.webrtc.socketNamespace}`;

    console.info(`socket address: ${socketURL}`);

    const socket = ioClient.connect(socketURL, {
      reconnectionDelay: 1000,
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'], // 'polling'
    });

    // reason (String) either ‘io server disconnect’,
    // ‘io client disconnect’, or ‘ping timeout’
    socket.on('disconnect', (reason) => {
      console.error('[wrtc]: socket disconnection, reason:', reason);
      Helper.wrtcPubsub.emit('socket state', 'DISCONNECTED');
    });

    // unfortunately when reconnection happen, etherpad break down totally
    // Helper.wrtcPubsub.emit('socket state', 'OPENED');
    socket.on('connect', () => {
      console.info(`socket join pad`, userId);
      socket.emit('join pad', padId, userId);
      Helper.wrtcPubsub.emit('socket state', 'OPENED');
    });

    socket.on('connect_error', (error) => {
      console.error('[wrtc]: socket connect_error:', error);
      Helper.wrtcPubsub.emit('socket state', 'DISCONNECTED');
    });

    // find containers
    padOuter = $('iframe[name="ace_outer"]').contents();
    padInner = padOuter.find('iframe[name="ace_inner"]');
    outerBody = padOuter.find('#outerdocbody');

    // insert wbrtc containers
    const $target = outerBody;
    if ($target.find('#wbrtc_avatarCol').length) return false;
    $target.prepend('<div id="wbrtc_avatarCol"></div>');

    // module settings
    $('#options-wrtc-heading').on('change', (e) => {
      const activated = $('#options-wrtc-heading').is(':checked');
      activated ? enableWrtcHeading() : disableWrtcHeading();
    });

    window.onerror = (message, source, lineno, colno, error) => {
      console.error('[wrtc]: windows error, close stream');
      if (window.headerId) WRTC.deactivate(clientVars.userId, window.headerId);
    };

    return socket;
  };

  return Object.freeze({
    init,
  });
})();

const getSocket = () => window.pad && window.pad.socket;

const hooks = {
  postAceInit: (hookName, context) => {
    const videoSettings = localStorage.getItem('videoSettings');
    if (!videoSettings) {
      const data = JSON.stringify({ microphone: null, speaker: null, camera: null });
      localStorage.setItem('videoSettings', data);
    }

    // If the ep_profile_modal plugin is disabled
    if (!clientVars.plugins.plugins.ep_profile_modal) {
      clientVars.webrtc.displayInlineAvatar = false;
    }

    // Bridge into the ep_profiles
    window.clientVars.ep_profile_list = {};
    getSocket().on('message', (obj) => {
      if (obj.type === 'COLLABROOM' && obj.data && obj.data.type === 'CUSTOM') {
        const data = obj.data.payload;
        if (data.action === 'EP_PROFILE_USERS_LIST') {
          data.list.forEach((el) => {
            if (!window.clientVars.ep_profile_list[el.userId]) {
              window.clientVars.ep_profile_list[el.userId] = {};
            }

            window.clientVars.ep_profile_list[el.userId] = el;
          });
        }
        if (data.action === 'EP_PROFILE_USER_LOGIN_UPDATE') {
          window.clientVars.ep_profile_list[data.userId] = data;
          if (Helper && Helper.wrtcPubsub) {
            Helper.wrtcPubsub.emit('update inlineAvatar info', data.userId, data);
          }
        }
      }
    });

    const ace = context.ace;
    const userId = window.pad.getUserId() || clientVars.padId;
    const padId = window.pad.getPadId() || clientVars.userId;

    // init ui native component
    ace.callWithAce((innerAce) => {});

    // TODO: make sure the priority of these components are in line
    // TODO: make sure clientVars contain all data that's necessary

    if (!clientVars.userId || !clientVars.padId) {
      throw new Error("[wrtc]: clientVars doesn't exists");
    }

    const socket = EPwrtcHeading.init(ace, padId, userId);
    WRTC.postAceInit(hookName, context, socket, padId);
    Helper.init(context);
    videoChat.postAceInit(hookName, context, socket, padId);
    WrtcRoom.postAceInit(hookName, context, socket, padId);

    // When Editor is ready, append video modal to body
    $('#editorcontainer iframe').ready(() => {
      WRTC.appendVideoModalToBody();
    });

    $(window).resize(_.debounce(WrtcRoom.adoptHeaderYRoom, 250));
  },
  aceEditEvent: (hookName, context) => {
    const eventType = context.callstack.editEvent.eventType;
    // ignore these types
    const invalidTypes = 'handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps';
    if (invalidTypes.includes(eventType)) return;

    // when a new line create
    if (context.callstack.domClean) WrtcRoom.adoptHeaderYRoom();
  },
  aceEditorCSS: () => {
    const version = clientVars.webrtc.version || 1;
    return [`ep_wrtc_heading/static/dist/css/innerLayer.css?v=${version}`];
  },
  userLeave: (hookName, context) => {
    WrtcRoom.userLeave(context);
    WRTC.userLeave(null, context);
    return;
  },
  handleClientMessage_RTC_MESSAGE: (hookName, context) => {
    WRTC.handleClientMessage_RTC_MESSAGE(hookName, context);
  },
};

exports.postAceInit = hooks.postAceInit;
exports.aceEditorCSS = hooks.aceEditorCSS;
exports.aceEditEvent = hooks.aceEditEvent;
exports.userLeave = hooks.userLeave;
exports.handleClientMessage_RTC_MESSAGE = hooks.handleClientMessage_RTC_MESSAGE;

exports.acePostWriteDomLineHTML = (hookName, context) => {
  const hasHeader = $(context.node).find(':header');
  if (hasHeader.length) {
    const headerId = hasHeader.attr('data-id');
    // FIXME: performance issue
    setTimeout(() => {
      WrtcRoom.syncVideoAvatars(headerId);
    }, 250);
  }
};

const hTags = ['h1', 'h2', 'h3', 'h4'];
// TODO: refactor
exports.aceDomLineProcessLineAttributes = (hookName, context) => {
  const cls = context.cls;
  const headingType = /(?:^| )headerId:([A-Za-z0-9]*)/.exec(cls);
  const result = [];
  if (typeof Helper === 'undefined') return result;

  if (headingType) {
    const headerType = /(?:^| )heading:([A-Za-z0-9]*)/.exec(cls);
    const headerId = headingType[1];
    const htagNum = headerType && headerType[1];

    // if video modal is open! update modal title
    if (Helper.wrtcStore.components.video.open) {
      const $header = Helper.findAceHeaderElement(headerId);
      Helper.wrtcPubsub.emit('updateWrtcToolbarTitleModal', $header.text, headerId);
    }

    const modifier = {
      preHtml: '',
      postHtml: `<chat-inline-icon data-headerid="${headerId}"></chat-inline-icon>`,
      processedMarker: true,
    };

    Helper.wrtcStore.rooms.set(headerId, {
      VIDEO: { list: [] },
      USERS: {},
      headerCount: 0,
    });
    if (htagNum && hTags.includes(htagNum)) result.push(modifier);
  }

  return result;
};
