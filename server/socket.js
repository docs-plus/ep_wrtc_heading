const _ = require('lodash');
const videoChat = require('./videoChat');
const textChat = require('./textChat');
const Queue = require('better-queue');
const sessioninfos = require('ep_etherpad-lite/node/handler/PadMessageHandler').sessioninfos;
let socketIo = null;


const roomStatus = {};
const maxTryToWaitAcceptNewCall = 13;

const acceptNewConnection = ({socket, padId, padparticipators, userData, target, callback}) => {
	let room = null;
	console.info(`process webrtc connection`)
  if (target === 'video') {
    room = videoChat.socketUserJoin(userData, padparticipators);
    _.set(socket, 'ndHolder.video', room.data);
  } else {
    room = textChat.socketUserJoin(userData, padparticipators);
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
    (({socket, padId,  padparticipators, userData, target, callback, retry}, cb) => {
      // Some processing here ...

      // Firt check if the room has accept call Prop
      if (!_.has(roomStatus, `${padId}.${userData.headerId}.acceptCall`)) {
        // if the Header does not exist create and set 'acceptCall' to false, for next request are comming throw
				_.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false);
				console.info(`Create room, accept call Prop. ${padId}.${userData.headerId}.acceptCall`)
        // in this case we have to process the request for the first time
        acceptNewConnection({socket, padparticipators, padId, userData, target, callback, retry});
        return cb();
			}


      // otherwise check the room that can accept new call
      // if it is, then `acceptNewConnection` otherwise push the request at the end of queue
      if (_.get(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false)) {
				console.info(`room ready to accept new call. ${padId}.${userData.headerId}.acceptCal`)
				_.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false);
        acceptNewConnection({socket, padparticipators, padId, userData, target, callback, retry});
      } else {
				console.info(`room not ready to accept new call. ${padId}.${userData.headerId}.acceptCal`)
        if (retry < maxTryToWaitAcceptNewCall) { 
					q.push({socket, padparticipators, padId, userData, target, callback, retry: retry += 1});
					console.info(`put the request in queue for next call. [retry]: ${retry}, [maxTryToWaitAcceptNewCall]: ${maxTryToWaitAcceptNewCall}`)
				} else { 
					callback(null, null, target);
					console.info(`unfortunately after ${retry} try, request must be terminate!`)
				}// acceptNewConnection({socket, padId, userData, target, callback, retry})
      }

      return cb(null, true);
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
		
			if(!_.get(roomStatus, `${padId}.${headerId}.acceptCall`, false)){
				_.set(roomStatus, `${padId}.${headerId}.acceptCall`, true);
				console.info(`yup, avilable the room to accept new call. ${padId}.${headerId}.acceptCall`)
			}
      // console.log("new acceptCall ", padId, headerId, _.get(roomStatus, `${padId}.${headerId}.acceptCall`))
    });

    socket.on('userJoin', (padId, padparticipators, userData, target, callback) => {
      // console.log("USERJOINING", padId, userData, target)
      q.push({socket, padId, padparticipators, userData, target, callback, retry: 0});
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

    socket.on('getTextMessages', async (padId, headId, pagination, callback) => {
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

    socket.on('getVideoRoomInfo', (padId, headerId, callback) => {
      const result = videoChat.getRoom(padId, headerId);
      callback(result);
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
