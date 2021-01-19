const Config = require('../config');

// data Structure
// "padId:headerId": [{object}]
const rooms = {};
const roomsQueue = {};

const getRoom = (padId, headerId) => {
  const roomKey = `${padId}:${headerId}`;
  return rooms[roomKey];
};

const socketUserJoin = (data, padparticipators) => {
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

  // clear participator, check if the current users are sync with room object
  rooms[roomKey] = rooms[roomKey].filter((x) => padparticipators.includes(x.userId));

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
  getRoom,
  socketUserJoin,
  socketUserLeave,
  socketDisconnect,

};
