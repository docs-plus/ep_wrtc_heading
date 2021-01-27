const db = require('./dbRepository');
const {TEXT_CHAT_KEY, TEXT_CHAT_LIMIT} = require('../config');
const latestTextChatId = {};
const rooms = {};

exports.socketUserJoin = (data, padparticipators) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  const result = {
    canUserJoin: false,
    info: {
      present: null,
      list: null,
    },
    data,
  };

  // if the room does not exist create the room for the first time.
  if (!rooms[roomKey]) { rooms[roomKey] = []; }


  result.info.present = rooms[roomKey].length;
  result.info.list = rooms[roomKey];

  // does user already joined the room?
  const isUserInRoom = rooms[roomKey].find((x) => x.userId === data.userId);
  if (isUserInRoom) return result;

  result.canUserJoin = true;
  rooms[roomKey].push(data);
  result.info.present++;

  // clear participator, check if the current users are sync with room object
  rooms[roomKey] = rooms[roomKey].filter((x) => padparticipators.includes(x.userId));

  return result;
};

exports.socketUserLeave = (data) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  const result = {
    data,
    info: null,
  };

  if (!rooms[roomKey]) return result;

  // remove user in that room
  rooms[roomKey] = rooms[roomKey].filter((x) => !(x.userId === data.userId));

  // if there is not anymore user in that room, delete room
  if (rooms[roomKey] && rooms[roomKey].length === 0) { delete rooms[roomKey]; }

  result.info = {
    present: rooms[roomKey] ? rooms[roomKey].length : 0,
    list: rooms[roomKey] || [],
  };

  return result;
};

exports.socketDisconnect = (data) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  const result = {
    data: null,
    roomInfo: null,
    padId,
  };

  if (!rooms[roomKey]) return result;

  // remove user in that room
  rooms[roomKey] = rooms[roomKey].filter((x) => !(x.userId === data.userId));

  // if there is not anymore user in that room, delete room
  if (rooms[roomKey] && rooms[roomKey].length === 0) { delete rooms[roomKey]; }

  const roomInfo = {
    present: rooms[roomKey] ? rooms[roomKey].length : 0,
    list: rooms[roomKey] || [],
  };

  result.data = data;
  result.roomInfo = roomInfo;

  return result;
};

exports.getMessages = async (padId, headId, {limit = TEXT_CHAT_LIMIT, offset = 0} = {limit, offset}) => {
  const dbKey = `${TEXT_CHAT_KEY + padId}:${headId}`;

  const lastMessageId = await db.getLatestId(`${dbKey}:*`);

  return db.getLastMessages(dbKey, lastMessageId, {limit, offset});
};

// WRTC:TEXT:padId:headerId:textId
exports.save = async (padId, headId, message) => {
  let messageKey = `${TEXT_CHAT_KEY + padId}:${headId}`;

  const existMessageId = ((((latestTextChatId || {})[padId]) || {})[headId]);

  if (!existMessageId) {
    let lastMessageId = await db.getLatestId(`${messageKey}:*`);
    lastMessageId = lastMessageId ? lastMessageId : 1;

    if (!latestTextChatId[padId]) { latestTextChatId[padId] = {}; }

    latestTextChatId[padId][headId] = lastMessageId;
  } else {
    latestTextChatId[padId][headId] = latestTextChatId[padId][headId] + 1;
  }

  const newMessageId = latestTextChatId[padId][headId];
  messageKey = `${messageKey}:${newMessageId}`;

  await db.set(messageKey, message);

  return newMessageId;
};
