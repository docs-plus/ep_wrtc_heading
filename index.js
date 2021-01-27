const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
const log4js = require('ep_etherpad-lite/node_modules/log4js');
const statsLogger = log4js.getLogger('stats');
const stats = require('ep_etherpad-lite/node/stats');
const packageJson = require('./package.json');
const Config = require('./config');
const {socketInit} = require('./server/socket');
// Make sure any updates to this are reflected in README
const statErrorNames = ['Abort', 'Hardware', 'NotFound', 'NotSupported', 'Permission', 'SecureConnection', 'Unknown'];

exports.socketio = socketInit;

exports.eejsBlock_mySettings = (hookName, args, cb) => {
  args.content += eejs.require('ep_wrtc_heading/static/templates/settings.ejs');
  return cb();
};

exports.eejsBlock_scripts = (hookName, args, cb) => {
  args.content += eejs.require('ep_wrtc_heading/static/dist/templates/webrtcComponent.mini.html', {}, module);
  args.content += `<script src='../static/plugins/ep_wrtc_heading/static/dist/js/wrtc.heading.mini.js?v=${packageJson.version}' defer></script>`;
  return cb();
};

exports.eejsBlock_styles = (hookName, args, cb) => {
  args.content += `<link rel="stylesheet" href="../static/plugins/ep_wrtc_heading/static/dist/css/outerLayer.css?v=${packageJson.version}" type="text/css" />`;
  return cb();
};

exports.clientVars = (hook, context, callback) => {
  let enabled = true;
  if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.enabled === false) {
    enabled = settings.ep_wrtc_heading.enabled;
  }

  let iceServers = [{url: 'stun:stun.l.google.com:19302'}];
  if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.iceServers) {
    iceServers = settings.ep_wrtc_heading.iceServers;
  }

  const video = {sizes: {}, codec: Config.get('VIDEO_CODEC')};
  if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.video && settings.ep_wrtc_heading.video.sizes) {
    video.sizes = {
      large: settings.ep_wrtc_heading.video.sizes.large,
      small: settings.ep_wrtc_heading.video.sizes.small,
    };
  }

  if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.videoChatLimit) {
    Config.update('VIDEO_CHAT_LIMIT', settings.ep_wrtc_heading.videoChatLimit);
  }

  if (settings.ep_wrtc_heading && settings.ep_wrtc_heading.videoCodec) {
    video.codec = settings.ep_wrtc_heading.videoCodec;
  }

  const result = {
    webrtc: {
      version: packageJson.version,
      videoChatLimit: Config.get('VIDEO_CHAT_LIMIT'),
      inlineAvatarLimit: Config.get('INLINE_AVATAR_LIMIT'),
      iceServers,
      enabled,
      video,
    },
  };

  return callback(result);
};

exports.handleMessage = (hook, context, callback) => {
  const result = [null];
  // console.log('exports.handleMessage', hook, context);
  if (context.message.type === 'STATS' && context.message.data.type === 'RTC_MESSAGE') {
    handleErrorStatMessage(context.message.data.statName);
    callback(result);
  } else {
    callback();
  }
};

const handleErrorStatMessage = (statName) => {
  if (statErrorNames.indexOf(statName) !== -1) {
    stats.meter(`ep_wrtc_heading_err_${statName}`).mark();
  } else {
    statsLogger.warn(`Invalid ep_wrtc_heading error stat: ${statName}`);
  }
}
