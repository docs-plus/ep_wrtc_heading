const _ = require('lodash');
const videoChat = require('./videoChat');
const textChat = require('./textChat');
const Queue = require('better-queue');
const sessioninfos = require('ep_etherpad-lite/node/handler/PadMessageHandler').sessioninfos;
let socketIo = null;

const roomStatus = {};
const maxTryToWaitAcceptNewCall = 10;

const acceptNewConnection = ({socket, padId, userData, target, callback}) => {
  let room = null;
  if (target === 'video') {
    room = videoChat.socketUserJoin(userData);
    _.set(socket, 'ndHolder.video', room.data);
  } else {
    room = textChat.socketUserJoin(userData);
    _.set(socket, 'ndHolder.text', room.data);
  }

  if (room.canUserJoin) {
    socket.broadcast.to(padId).emit('userJoin', room.data, room.info, target);
    callback(room.data, room.info, target);
  } else {
    callback(null, room.info, target);
  }
};

const q = new Queue(
    (({socket, padId, userData, target, callback, retry}, cb) => {
      // Some processing here ...

      // Firt check if the room has accept call Prop
      if (!_.has(roomStatus, `${padId}.${userData.headerId}.acceptCall`)) {
        // if the Header does not exist create and set 'acceptCall' to false, for next request are comming throw
        _.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false);
        // in this case we have to process the request for the first time
        acceptNewConnection({socket, padId, userData, target, callback, retry});
        return cb();
      }


      // second check the room that can accept new call
      // if it is, then `acceptNewConnection` otherwise push the request at the end of queue
      if (_.get(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false)) {
        acceptNewConnection({socket, padId, userData, target, callback, retry});
      } else {
        if (retry < maxTryToWaitAcceptNewCall) { q.push({socket, padId, userData, target, callback, retry: retry += 1}); } else { callback(null, null, target); }// acceptNewConnection({socket, padId, userData, target, callback, retry})
      }

      cb(null, true);
    }),
    {afterProcessDelay: 3000}
);

function socketInit(hookName, args, cb) {
  socketIo = args.io;
  const io = args.io;

  io.of('/heading_chat_room').on('connect', (socket) => {
    socket.on('join pad', (padId, userId, callback) => {
      socket.ndHolder = {video: {}, text: {}};
      socket.ndHolder.video = {userId, padId};
      socket.ndHolder.text = {userId, padId};
      socket.join(padId);
      callback(null);
    });

    socket.on('acceptNewCall', (padId, headerId, callback) => {
      // console.log("new acceptCall ", padId, headerId)
      _.set(roomStatus, `${padId}.${headerId}.acceptCall`, true);
      // console.log("new acceptCall ", padId, headerId, _.get(roomStatus, `${padId}.${headerId}.acceptCall`))
    });

    socket.on('userJoin', (padId, userData, target, callback) => {
      // console.log("USERJOINING", padId, userData, target)
      q.push({socket, padId, userData, target, callback, retry: 0});
    });

    socket.on('userLeave', (padId, userData, target, callback) => {
      let room = null;

      if (target === 'video') room = videoChat.socketUserLeave(userData);
      else room = textChat.socketUserLeave(userData);

      if (!room.data || !room.info) return callback(null, null, target);

      socket.broadcast
          .to(padId)
          .emit('userLeave', room.data, room.info, target);
      callback(room.data, room.info, target);
    });

    socket.on(
        'getTextMessages',
        async (padId, headId, pagination, callback) => {
          // get last message id, then get last newest message, then send to client
          const messages = await textChat
              .getMessages(padId, headId, pagination)
              .catch((error) => {
                throw new Error(
                    `[socket]: get text messages has an error, ${error.message}`
                );
              });

          callback(messages);
        }
    );

    socket.on('sendTextMessage', async (padId, headId, message, callback) => {
      // save text message and get messageId
      // combine message with messageId then past back to user
      // then broad cast to pad
      const messageId = await textChat
          .save(padId, headId, message)
          .catch((error) => {
            throw new Error(
                `[socket]: send text message has an error, ${error.message}`
            );
          });

      socket.broadcast
          .to(padId)
          .emit(`receiveTextMessage:${headId}`, headId, message);
      callback(message, messageId);
    });

    socket.on('bulkUpdateRooms', (padId, hTagList, target, callback) => {
      let room = null;

      if (target === 'video') {
        room = videoChat.socketBulkUpdateRooms(padId, hTagList);
      } else {
        room = textChat.socketBulkUpdateRooms(padId, hTagList);
      }

      if (!room.collection || !room.info) return false;

      // socket.broadcast.to(padId).emit(`bulkUpdateRooms:${target}`, room.collection, room.info, target)
      callback(room.collection, room.info, target);
    });

    socket.on('pingil', (padId, headerId, userId, latency) => {
      socket.broadcast
          .to(padId)
          .emit('userLatancy', {padId, headerId, userId, latency});
      socket.emit('pongol', {padId, headerId, userId, latency});
    });

    socket.on('reloadVideoSession', (padId, headerId) => {
      io.of('/heading_chat_room').to(padId).emit('reloadVideoSession', headerId);
    });

    socket.on('disconnect', () => {
      // remove the user from text and video chat
      const userData = socket.ndHolder;

      // in the case when pad does not load plugin properly,
      // there is no 'ndHolder'(userData)
      if (!userData || !userData.text || !userData.video) return false;

      const targetRoom = Object.keys(userData).filter(
          (room) => userData[room].headerId && room
      );

      targetRoom.forEach((chatRoom) => {
        let room = null;

        if (chatRoom === 'video') { room = videoChat.socketDisconnect(userData[chatRoom]); } else if (chatRoom === 'text') { room = textChat.socketDisconnect(userData[chatRoom]); }

        console.info('socket disconnect: userLeave', room.data);

        // if(room && room.padId)
        // socket.broadcast.to(room.padId).emit("userLeave", room.data, room.roomInfo, chatRoom)
      });
    });

    socket.on('RTC_MESSAGE', (context) => {
      if (context.type === 'RTC_MESSAGE') {
        Object.assign(context, {client: {id: socket.id.split('#')[1]}});
        handleRTCMessage(context.client, context.payload);
      }
    });
  });
}

/**
 * Handles an RTC Message
 * @param client the client that send this message
 * @param message the message from the client
 */
function handleRTCMessage(client, payload) {
  // if(!socketIo) return false
  const userId = sessioninfos[client.id].author;
  const to = payload.to;
  const padId = sessioninfos[client.id].padId;
  const room = socketIo.sockets.adapter.rooms[padId];
  const clients = [];

  if (room && room.sockets) {
    for (const id in room.sockets) {
      clients.push(socketIo.sockets.sockets[id]);
    }
  }

  const msg = {
    type: 'COLLABROOM',
    data: {
      type: 'RTC_MESSAGE',
      payload: {
        from: userId,
        data: payload.data,
      },
    },
  };
  // Lookup recipient and send message
  for (let i = 0; i < clients.length; i++) {
    const session = sessioninfos[clients[i].id];
    if (session && session.author === to) {
      clients[i].json.send(msg);
      // socketIo.of('/heading_chat_room').to(padId).emit('RTC_MESSAGE', msg);
      break;
    }
  }
}

module.exports = {
  socketInit,
  socketIo,
  handleRTCMessage,
};
