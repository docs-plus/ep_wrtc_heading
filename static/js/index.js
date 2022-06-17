import _ from 'lodash';
import ioClient from 'socket.io-client';
import './lib/getUserMediaPolyfill';
import './lib/adapter';
import * as Helper from './lib/helpers';
import WRTC from './lib/webrtc';
import WrtcRoom from './lib/webrtcRoom';
import videoChat from './lib/videoChat';

const getSocket = () => window.pad && window.pad.socket;

const enableWrtcHeading = () => {
  Helper.wrtcPubsub.emit('plugin enable', true);
};

const disableWrtcHeading = () => {
  Helper.wrtcPubsub.emit('plugin enable', false);
};

const initialWebSocket = (ace, padId, userId) => {
  // socket connection
  let newIo = ioClient;
  const {
    webSocket: {OPENED, DISCONNECTED},
  } = Helper.wrtcStore.staticVar;

  const loc = document.location;
  const port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
  let socketURL = clientVars.webrtc.socketRemoteAddress;
  // if plugin run in the localhost or mention
  // manually use The Etherpad socket instead of ws-gateway
  if (clientVars.webrtc.useEtherpadSocket || loc.hostname === 'localhost') {
    newIo = io;
    socketURL = `${loc.protocol}//${loc.hostname}:${port}`;
  }

  socketURL = `${socketURL}/${clientVars.webrtc.socketNamespace}`;

  console.info(`socket address: ${socketURL}`);

  const socket = newIo.connect(socketURL, {
    reconnectionDelay: 1000,
    autoConnect: true,
    reconnection: true,
    transports: ['websocket'], // 'polling'
  });

  // unfortunately when reconnection happen, etherpad break down totally
  socket.on('connect', () => {
    socket.emit('join pad', padId, userId);
    Helper.wrtcPubsub.emit('socket state', OPENED, socket);
  });

  // reason (String) either ‘io server disconnect’,
  // ‘io client disconnect’, or ‘ping timeout’
  socket.on('disconnect', (reason) => {
    console.error('[wrtc]: socket disconnection, reason:', reason);
    Helper.wrtcPubsub.emit('socket state', DISCONNECTED, socket);
  });

  socket.on('connect_error', (error) => {
    console.error('[wrtc]: socket connect_error:', error);
    Helper.wrtcPubsub.emit('socket state', DISCONNECTED, socket);
  });

  return socket;
};

export const postAceInit = (hookName, context) => {
  const videoSettings = localStorage.getItem('videoSettings');
  if (!videoSettings) {
    const data = JSON.stringify({microphone: null, speaker: null, camera: null});
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

  // TODO: make sure the priority of these components are in line
  // TODO: make sure clientVars contain all data that's necessary

  if (!clientVars.userId || !clientVars.padId) {
    throw new Error("[wrtc]: clientVars doesn't exists");
  }

  const socket = initialWebSocket(ace, padId, userId);
  WRTC.postAceInit(hookName, context, socket, padId);
  // Helper.init(context);
  videoChat.postAceInit(hookName, context, socket, padId);
  WrtcRoom.postAceInit(hookName, context, socket, padId);

  // When Editor is ready, append video modal to body
  $('#editorcontainer iframe').ready(() => {
    WRTC.appendVideoModalToBody();
  });

  // module settings
  $('#options-wrtc-heading').on('change', (e) => {
    const activated = $('#options-wrtc-heading').is(':checked');
    activated ? enableWrtcHeading() : disableWrtcHeading();
  });

  window.onerror = (message, source, lineno, colno, error) => {
    console.error('[wrtc]: windows error, close stream');
    if (window.headerId) videoChat.catchBrowserError(clientVars.userId, window.headerId);
  };

  // find containers
  const padOuter = $('iframe[name="ace_outer"]').contents();
  const outerBody = padOuter.find('#outerdocbody');

  // insert wbrtc containers
  const $target = outerBody;
  if ($target.find('#wbrtc_avatarCol').length) return false;
  $target.prepend('<div id="wbrtc_avatarCol" class="usersIconList"></div>');


  $(window).resize(_.debounce(WrtcRoom.adoptHeaderYRoom, 250));
};

export const aceEditEvent = (hookName, context) => {
  const eventType = context.callstack.editEvent.eventType;
  // ignore these types
  const invalidTypes = 'handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps';
  if (invalidTypes.includes(eventType)) return;

  // when a new line create
  if (context.callstack.domClean) WrtcRoom.adoptHeaderYRoom();
};

export const aceEditorCSS = () => {
  const version = clientVars.webrtc.version || 1;
  if ($('body').hasClass('mobileView')) {
    return [`ep_wrtc_heading/static/dist/css/innerLayer_mobile.css?v=${version}`];
  }
  return [`ep_wrtc_heading/static/dist/css/innerLayer.css?v=${version}`];
};

export const userLeave = (hookName, context) => {
  WrtcRoom.userLeave(context);
  WRTC.userLeave(null, context);
  return;
};

export const handleClientMessage_RTC_MESSAGE = (hookName, context) => {
  WRTC.handleClientMessage_RTC_MESSAGE(hookName, context);
  return;
};

export const acePostWriteDomLineHTML = (hookName, context) => {
  const hasHeader = $(context.node).find(':header');
  if (hasHeader.length) {
    const headerId = hasHeader.attr('data-id');
    // FIXME: performance issue
    setTimeout(() => {
      WrtcRoom.syncVideoAvatars(headerId);
    }, 250);
  }
  return;
};

// TODO: refactor
export const aceDomLineProcessLineAttributes = (hookName, context) => {
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

    const mobileAttr = $('body').hasClass('mobileView') ? 'mobile' : 'desktop';

    const modifier = {
      preHtml: '',
      postHtml: `<chat-inline-icon headerid="${headerId}" ${mobileAttr}></chat-inline-icon>`,
      processedMarker: true,
    };

    Helper.wrtcStore.rooms.set(headerId, {
      VIDEO: {list: []},
      USERS: {},
      headerCount: 0,
    });
    if (htagNum && Helper.hTags.includes(htagNum)) result.push(modifier);
  }

  return result;
};
