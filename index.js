'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
const log4js = require('ep_etherpad-lite/node_modules/log4js');
const statsLogger = log4js.getLogger('stats');
const stats = require('ep_etherpad-lite/node/stats');
const packageJson = require('./package.json');
const Config = require('./config');
// Make sure any updates to this are reflected in README
const statErrorNames = [
  'Abort',
  'Hardware',
  'NotFound',
  'NotSupported',
  'Permission',
  'SecureConnection',
  'Unknown',
];

const handleErrorStatMessage = (statName) => {
  if (statErrorNames.indexOf(statName) !== -1) {
    stats.meter(`ep_wrtc_heading_err_${statName}`).mark();
  } else {
    statsLogger.warn(`Invalid ep_wrtc_heading error stat: ${statName}`);
  }
};

if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.hasOwnProperty('useEtherpadSocket')) {
  Config.update('USE_ETHERPAD_SOCKET', settings.ep_wrtc_heading.useEtherpadSocket);
}

let io;

const useEtherpadSocket = Config.get('USE_ETHERPAD_SOCKET');
const socketNamespace = Config.get('SOCKET_NAMESPACE');
// TODO: support etherpad socket
exports.socketio = (hookName, args, cb) => {
  if (settings.ep_wrtc_heading && useEtherpadSocket) {
    console.info('[wrtc]: use etherpad socket system');
    io = args.io.of(`/${socketNamespace}`);
    const opt = {
      pid: process.pid,
      namespace: socketNamespace,
      preservedNamespace: {},
    };
    require('./server/ws.router').init(io, opt);
  }
  return cb();
};

exports.eejsBlock_mySettings = (hookName, args, cb) => {
  args.content += eejs.require('ep_wrtc_heading/static/templates/settings.ejs');
  return cb();
};

exports.eejsBlock_scripts = (hookName, args, cb) => {
  const html = 'ep_wrtc_heading/static/dist/templates/webrtcComponent.mini.html';
  const js = `../static/plugins/ep_wrtc_heading/static/dist/js/wrtc.heading.mini.js?`;
  args.content += eejs.require(html, {}, module);
  const src = `${js}v=${packageJson.version}`;
  args.content += `<script src='${src}' defer></script>`;
  return cb();
};

exports.eejsBlock_styles = (hookName, args, cb) => {
  args.content += `<link rel="stylesheet" href="../static/plugins/ep_wrtc_heading/static/dist/css/outerLayer.css?v=${packageJson.version}" type="text/css" />`;
  return cb();
};

exports.clientVars = (hookName, context, callback) => {
  const enabled = true;
  let remoteSocketAddress = Config.get('CLIENT_SOCKET_REMOTE_ADDRESS');
  const iceServers = [{ urls: [Config.get('GOOGLE_STUN_SERVER')] }];
  const video = { sizes: {}, codec: Config.get('VIDEO_CODEC') };

  if (settings.ep_wrtc_heading) {
    let { enabled } = settings.ep_wrtc_heading;
    const {
      video,
      videoChatLimit,
      videoCodec,
      displayInlineAvatar,
      socketAddress,
    } = settings.ep_wrtc_heading;

    if (enabled === false) {
      enabled = settings.ep_wrtc_heading.enabled;
    }

    if (videoCodec) {
      video.codec = videoCodec;
    }

    if (video && video.sizes) {
      video.sizes = {
        large: video.sizes.large,
        small: video.sizes.small,
      };
    }

    if (videoChatLimit) {
      Config.update('VIDEO_CHAT_LIMIT', videoChatLimit);
    }

    if (socketAddress) {
      remoteSocketAddress = socketAddress;
      Config.update('CLIENT_SOCKET_REMOTE_ADDRESS', remoteSocketAddress);
    }

    if (displayInlineAvatar) {
      Config.update('DISPLAY_INLINE_AVATAR', displayInlineAvatar);
    }
  }

  const result = {
    webrtc: {
      version: packageJson.version,
      useEtherpadSocket,
      socketRemoteAddress: remoteSocketAddress,
      socketNamespace,
      videoChatLimit: Config.get('VIDEO_CHAT_LIMIT'),
      inlineAvatarLimit: Config.get('INLINE_AVATAR_LIMIT'),
      displayInlineAvatar: Config.get('DISPLAY_INLINE_AVATAR'),
      iceServers,
      enabled,
      video,
    },
  };

  return callback(result);
};

exports.handleMessage = (hookName, context, callback) => {
  const result = [null];
  if (context.message.type === 'STATS' && context.message.data.type === 'RTC_MESSAGE') {
    handleErrorStatMessage(context.message.data.statName);
    callback(result);
  } else {
    callback();
  }
};
