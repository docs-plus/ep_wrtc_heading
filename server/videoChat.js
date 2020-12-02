const Config = require('../config');

// data Structure
// "padId:headerId": [{object}]
const rooms = {};
const roomsQueue = {};

const socketUserJoin = (data) => {
  const padId = data.padId;
  const headerId = data.headerId;
  const roomKey = `${padId}:${headerId}`;
  let canUserJoin = false;

  // if the room does not exist create the room for the first time.
  if (!rooms[roomKey]) {
    rooms[roomKey] = [];
  }

  // does user already joined the room?
  const isUserInRoom = rooms[roomKey].find((x) => x.userId === data.userId);
  if (isUserInRoom) return false;

  const info = {
    present: rooms[roomKey].length,
    list: rooms[roomKey],
  };

  if (info.present < Config.get('VIDEO_CHAT_LIMIT')) {
    canUserJoin = true;
    rooms[roomKey].push(data);
    info.present++;
  } else {
    canUserJoin = false;
  }

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

  if (!rooms[roomKey]) return result;

  // remove user in that room
  rooms[roomKey] = rooms[roomKey].filter((x) => !(x.userId === data.userId));

  // if there is not anymore user in that room, delete room
  if (rooms[roomKey] && rooms[roomKey].length === 0) { delete rooms[roomKey]; }

  const info = {
    present: rooms[roomKey] ? rooms[roomKey].length : 0,
    list: rooms[roomKey] || [],
  };

  result.data = data;
  result.info = info;

  return result;
};

const socketBulkUpdateRooms = (padId, hTagList) => {
  const result = {
    roomCollection: null,
    roomInfo: null,
  };

  // remove the room that not available and excrete user from room
  // hTagList: [ headingTagId ]
  // remove a pad:headerId, if there is not anymore user in that room
  hTagList.forEach((el) => {
    const roomKey = `${padId}:${el.headerId}`;
    if (rooms[roomKey] && rooms[roomKey].length === 0) { delete rooms[roomKey]; }
  });

  const roomKeys = Object.keys(rooms).filter((x) => x.includes(padId));

  if (!roomKeys) return result;

  const roomCollection = {};

  roomKeys.forEach((roomKey) => {
    if (!roomCollection[roomKey]) { roomCollection[roomKey] = rooms[roomKey]; }
  });

  result.collection = roomCollection;
  result.info = {
    present: 0,
    list: [],
  };

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

module.exports = {
  socketUserJoin,
  socketBulkUpdateRooms,
  socketUserLeave,
  socketDisconnect,

};
