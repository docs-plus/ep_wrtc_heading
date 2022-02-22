'use strict';

const Config = require('../config');

// data Structure
// "padId:headerId": [{object}]
const rooms = new Map();

/**
 *
 * @param {string} padId
 * @param {string} headerId
 */
const getRoom = (padId, headerId) => {
  const roomKey = `${padId}:${headerId}`;
  return rooms.get(roomKey);
};

const socketUserJoin = (data, participators) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  let canUserJoin = false;

  // if the room does not exist create the room for the first time.
  if (!rooms.has(roomKey)) {
    rooms.set(roomKey, []);
  }

  // does user already joined the room?
  const isUserInRoom = rooms.get(roomKey).find((x) => x.userId === data.userId);
  if (isUserInRoom) return false;

  const info = {
    present: rooms.get(roomKey).length,
    list: rooms.get(roomKey),
  };

  if (info.present < Config.get('VIDEO_CHAT_LIMIT')) {
    canUserJoin = true;
    const newRoom = rooms.get(roomKey);
    newRoom.push(data);
    rooms.set(roomKey, newRoom);
    info.present++;
  } else {
    canUserJoin = false;
  }

  // clear participator, check if the current users are sync with room object
  // TODO: This one does not work, I think i have to move it up!
  rooms.set(
    roomKey,
    rooms.get(roomKey).filter((x) => participators.includes(x.userId)),
  );

  return {
    canUserJoin,
    info,
    data,
  };
};

const socketUserLeave = (data) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  const result = {
    data: null,
    info: null,
  };

  if (!rooms.has(roomKey)) return result;

  // remove user in that room
  rooms.set(roomKey, rooms.get(roomKey).filter((x) => !(x.userId === data.userId)));

  // if there is not anymore user in that room, delete room
  if (rooms.has(roomKey) && rooms.get(roomKey).length === 0) { rooms.delete(roomKey); }

  const info = {
    present: rooms.has(roomKey) ? rooms.get(roomKey).length : 0,
    list: rooms.get(roomKey) || [],
  };

  result.data = data;
  result.info = info;

  return result;
};

const socketDisconnect = (data) => {
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
    present: rooms.get(roomKey) ? rooms.get(roomKey).length : 0,
    list: rooms.get(roomKey) || [],
  };

  result.data = data;
  result.roomInfo = roomInfo;

  return result;
};

module.exports = {
  getRoom,
  socketUserJoin,
  socketUserLeave,
  socketDisconnect,

};
