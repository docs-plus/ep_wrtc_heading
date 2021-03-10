const db = require('./dbRepository');
const {TEXT_CHAT_KEY, TEXT_CHAT_LIMIT} = require('../config');
const latestTextChatId = {};
let rooms = new Map();

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
  if (!rooms.has(roomKey)) { rooms.set(roomKey, []); }

  result.info.present = rooms.get(roomKey).length;
  result.info.list = rooms.get(roomKey);

  // does user already joined the room?
  const isUserInRoom = rooms.get(roomKey).find((x) => x.userId === data.userId);
  if (isUserInRoom) return result;

  result.canUserJoin = true;

	const newRoom = rooms.get(roomKey);
	newRoom.push(data)
	rooms.set(roomKey, newRoom);

  result.info.present++;

  // clear participator, check if the current users are sync with room object
  rooms.set(roomKey, rooms.get(roomKey).filter((x) => padparticipators.includes(x.userId)));

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

  if (!rooms.has(roomKey)) return result;

  // remove user in that room
  rooms.set(roomKey, rooms.get(roomKey).filter((x) => !(x.userId === data.userId))) 

  // if there is not anymore user in that room, delete room
  if (rooms.has(roomKey) && rooms.get(roomKey).length === 0) { rooms.delete(roomKey); }

  result.info = {
    present: rooms.has(roomKey) ? rooms.get(roomKey).length : 0,
    list: rooms.get(roomKey) || [],
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

  if (!rooms.has(roomKey)) return result;

  // remove user in that room
  rooms.set(roomKey, rooms.get(roomKey).filter((x) => !(x.userId === data.userId)));

  // if there is not anymore user in that room, delete room
  if (rooms.has(roomKey) && rooms.get(roomKey).length === 0) { rooms.delete(roomKey); }

  const roomInfo = {
    present: rooms.has(roomKey) ? rooms.get(roomKey).length : 0,
    list: rooms.get(roomKey) || [],
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
