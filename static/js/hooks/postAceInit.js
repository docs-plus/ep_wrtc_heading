import _ from 'lodash';
import * as ioClient from 'socket.io-client';
import * as Helper from '../lib/helpers';

const setupInitialConfig = (context) => {
  const videoSettings = localStorage.getItem('videoSettings');
  if (!videoSettings) {
    const data = JSON.stringify({
      microphone: null,
      speaker: null,
      camera: null,
    });
    localStorage.setItem('videoSettings', data);
  }

  Helper.wrtcPubsub.emit('globalVar', {
    ace: context.ace,
    userId: window.pad.getUserId() || clientVars.padId,
    padId: window.pad.getPadId() || clientVars.userId,
  });
};

// const initialWebSocket = () => {
//   // socket connection
//   let newIo = ioClient;
//   const {
//     webSocket: { OPENED, DISCONNECTED },
//     padId,
//     userId,

//   } = Helper.wrtcStore.staticVar;

//   const loc = document.location;
//   const port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
//   let socketURL = clientVars.webrtc.socketRemoteAddress;
//   // if plugin run in the localhost or mention
//   // manually use The Etherpad socket instead of ws-gateway
//   if (clientVars.webrtc.useEtherpadSocket || loc.hostname === 'localhost') {
//     newIo = io;
//     socketURL = `${loc.protocol}//${loc.hostname}:${port}`;
//   }

//   socketURL = `${socketURL}/${clientVars.webrtc.socketNamespace}`;

//   console.info(`socket address: ${socketURL}`);

//   const socket = newIo.connect(socketURL, {
//     reconnectionDelay: 1000,
//     autoConnect: true,
//     reconnection: true,
//     transports: ['websocket'], // 'polling'
//   });

//   // unfortunately when reconnection happen, etherpad break down totally
//   socket.on('connect', () => {
//     socket.emit('join pad', padId, userId);
//     Helper.wrtcPubsub.emit('socket state', OPENED, socket);
//   });

//   // reason (String) either ‘io server disconnect’,
//   // ‘io client disconnect’, or ‘ping timeout’
//   socket.on('disconnect', (reason) => {
//     console.error('[wrtc]: socket disconnection, reason:', reason);
//     Helper.wrtcPubsub.emit('socket state', DISCONNECTED, socket);
//   });

//   socket.on('connect_error', (error) => {
//     console.error('[wrtc]: socket connect_error:', error);
//     Helper.wrtcPubsub.emit('socket state', DISCONNECTED, socket);
//   });
// };

// const setupBridgeToOtherPlugins = () => {
//   const {
//     epProfileState,
//     socketState,
//     staticVar: {
//       webSocket: { OPENED, DISCONNECTED },
//     },
//   } = Helper.wrtcStore;

//   console.info(epProfileState, OPENED, DISCONNECTED);
//   // if history state has change fire joinQueryString
//   document.addEventListener('onPushState', (event) => {
//     if (socketState) {
//       const { state } = event.detail;
//       if (state.type === 'hyperLink') {
//         const href = state.href;
//         WRoom.joinWithQueryString(href);
//       }
//     }
//   });
// };

// const appendVideoModalToBody = () => {
//   // When Editor is ready, append video  modal to body
//   $('#editorcontainer iframe').ready(() => {
//     WRTC.appendVideoModalToBody();
//   });
// };

export const postAceInit = (hookName, context) => {
  // so first I have to wait for clientvar be ready then initial other components

  // setup static config and data repository
  // setupInitialConfig(context);

  // setup web socket connection and primary listener
  // initialWebSocket();

  // bridge to the other plugin that can use their functionality
  // setupBridgeToOtherPlugins();

  // setup static html box elements
  // appendVideoModalToBody();

  // const socket = EPwrtcHeading.init(ace, padId, userId);
  // WRTC.postAceInit(hookName, context, socket, padId);
  // videoChat.postAceInit(hookName, context, socket, padId);
  // WRoom.postAceInit(hookName, context, socket, padId);

  $(window).resize(_.debounce(Helper.adjustAvatarAlignMent, 250));
};

// const EPwrtcHeading = (() => {
//   let padOuter;
//   let outerBody;
//   let padInner;

//   const enableWrtcHeading = () => {
//     Helper.wrtcPubsub.emit('plugin enable', true);
//   };

//   const disableWrtcHeading = () => {
//     Helper.wrtcPubsub.emit('plugin enable', false);
//   };

//   const initSocket = () => {
//     // socket connection
//     const loc = document.location;
//     const port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
//     let socketURL = clientVars.webrtc.socketRemoteAddress;
//     if (clientVars.webrtc.useEtherpadSocket || loc.hostname === 'localhost') {
//       ioClient = io;
//       socketURL = `${loc.protocol}//${loc.hostname}:${port}`;
//     }
//     socketURL = `${socketURL}/${clientVars.webrtc.socketNamespace}`;

//     console.info(`socket address: ${socketURL}`);

//     const socket = ioClient.connect(socketURL, {
//       reconnectionDelay: 1000,
//       autoConnect: true,
//       reconnection: true,
//       transports: ['websocket'], // 'polling'
//     });

//     // reason (String) either ‘io server disconnect’, ‘io client disconnect’, or ‘ping timeout’
//     socket.on('disconnect', (reason) => {
//       console.error('[wrtc]: socket disconnection, reason:', reason);
//       Helper.wrtcPubsub.emit('socket state', 'DISCONNECTED');
//     });

//     // unfortunately when reconnection happen, etherpad break down totally
//     socket.on('connect', () => {
//       socket.emit('join pad', padId, userId);
//       console.log("hi man sookokokokokok")
//       Helper.wrtcPubsub.emit('socket state', 'OPEND');
//     });

//     socket.on('connect_error', (error) => {
//       console.error('[wrtc]: socket connect_error:', error);
//       Helper.wrtcPubsub.emit('socket state', 'DISCONNECTED');
//     });

//     return socket
//   };

//   const init = (ace, padId, userId) => {
//     const socket = initSocket();

//     // find containers
//     padOuter = $('iframe[name="ace_outer"]').contents();
//     padInner = padOuter.find('iframe[name="ace_inner"]');
//     outerBody = padOuter.find('#outerdocbody');

//     // insert wbrtc containers
//     const $target = outerBody;
//     if ($target.find('#wbrtc_avatarCol').length) return false;
//     $target.prepend('<div id="wbrtc_avatarCol"></div>');

//     // module settings
//     $('#options-wrtc-heading').on('change', (e) => {
//       $('#options-wrtc-heading').is(':checked') ? enableWrtcHeading() : disableWrtcHeading();
//     });

//     // TODO: refactore
//     window.onerror = (message, source, lineno, colno, error) => {
//       console.error('[wrtc]: windows error, close stream');
//       if (window.headerId) WRTC.deactivate(clientVars.userId, window.headerId);
//     };

//     return socket;
//   };

//   const bridgeToEpProfile = () => {

//   };

//   return Object.freeze({
//     init,
//   });
// })();

/** **********************************************************************/
/*                           Etherpad Hooks                             */
/** **********************************************************************/







//   // If the ep_profile_modal plugin is disabled
//   if (!clientVars.plugins.plugins.ep_profile_modal) {
//     clientVars.webrtc.displayInlineAvatar = false;
//     Helper.wrtcStore.epProfileState = false;
//   }

//   if(!epProfileState) return;

//   // Bridge into the ep_profiles
//   window.clientVars.ep_profile_list = {};
//   Helper.getEtherpadSocket().on('message', (obj) => {
//     if (obj.type === 'COLLABROOM' && obj.data && obj.data.type === 'CUSTOM') {
//       const data = obj.data.payload;
//       if (data.action === 'EP_PROFILE_USERS_LIST') {
//         data.list.forEach((el) => {
//           if (!window.clientVars.ep_profile_list[el.userId]) window.clientVars.ep_profile_list[el.userId] = {};
//           window.clientVars.ep_profile_list[el.userId] = el;
//         });
//       }
//       if (data.action === 'EP_PROFILE_USER_LOGIN_UPDATE') {
//         window.clientVars.ep_profile_list[data.userId] = data;
//         if (Helper && Helper.wrtcPubsub) {
//           Helper.wrtcPubsub.emit('update inlineAvatar info', data.userId, data, () => {});
//         }
//       }
//     }
//   });
// }

