const settings = {
  VIDEO_CHAT_LIMIT: 2000,
  TEXT_CHAT_KEY: 'WRTC:TEXT:',
  TEXT_CHAT_LIMIT: 70,
  INLINE_AVATAR_LIMIT: 6,
  VIDEO_CODEC: 'VP9',
  AUDIO_CODEC: 'OPUS',
  CLIENT_SOCKET_REMOTE_ADDRESS: '',
  SOCKET_NAMESPACE: 'heading_chat_room',
  USE_ETHERPAD_SOCKET: true,
  DISPLAY_INLINE_AVATAR: true,
  GOOGLE_STUN_SERVER: 'stun:stun.l.google.com:19302',
};

const update = (key, val) => {
  if (!settings[key]) return false;
  settings[key] = val;
  return val;
};

const get = (key) => {
  if (!settings[key]) return false;
  return settings[key];
};

module.exports = {
  update,
  get,
};
