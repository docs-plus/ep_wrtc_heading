const settings = {
  VIDEO_CHAT_LIMIT: 3,
  TEXT_CHAT_KEY: 'WRTC:TEXT:',
  TEXT_CHAT_LIMIT: 70,
  INLINE_AVATAR_LIMIT: 6,
  VIDEO_CODEC: 'VP9',
  AUDIO_CODEC: 'OPUS',
	CLIENT_SOCKET_REMOTE_ADDRESS: "https://ws.docs.plus",
	CLIENT_SOCKET_LOCAL_ADDRESS:	 "http://localhost:3000"
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
