'use strict';

const _ = require('lodash');
const videoChat = require('./videoChat');
const Queue = require('better-queue');
let socketIo = null;

const roomStatus = {};
const maxTryToWaitAcceptNewCall = 3;

const acceptNewConnection = ({socket, padId, padparticipators, userData, target, callback}) => {
  let room = null;
  console.info('process webrtc connection');
  // assign user socket id
  Object.assign(userData, {socketId: socket.id});
  if (target === 'video') {
    room = videoChat.socketUserJoin(userData, padparticipators);
    _.set(socket, 'ndHolder.video', room.data);
  }

  if (room.canUserJoin) {
    socket.broadcast.to(padId).emit('userJoin', room.data, room.info, target);
    callback(room.data, room.info, target);
  } else {
    callback(null, room.info, target);
  }
};

const q = new Queue(
    (({socket, padId, padparticipators, userData, target, callback, retry}, cb) => {
      // Some processing here ...

      // Firt check if the room has accept call Prop
      if (!_.has(roomStatus, `${padId}.${userData.headerId}.acceptCall`)) {
        // if the Header does not exist create and set 'acceptCall' to false, for next request are comming throw
        _.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false);
        console.info(`Create room, accept call Prop. ${padId}.${userData.headerId}.acceptCall`);
        // in this case we have to process the request for the first time
        acceptNewConnection({socket, padparticipators, padId, userData, target, callback, retry});
        return cb();
      }

      // otherwise check the room that can accept new call
      // if it is, then `acceptNewConnection` otherwise push the request at the end of queue
      if (_.get(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false)) {
        console.info(`room ready to accept new call. ${padId}.${userData.headerId}.acceptCal`);
        _.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, false);
        acceptNewConnection({socket, padparticipators, padId, userData, target, callback, retry});
      } else {
        console.info(`room not ready to accept new call. ${padId}.${userData.headerId}.acceptCal`);
        if (retry < maxTryToWaitAcceptNewCall) {
          q.push({socket, padparticipators, padId, userData, target, callback, retry: retry += 1});
          console.info(`put the request in queue for next call. [retry]: ${retry}, [maxTryToWaitAcceptNewCall]: ${maxTryToWaitAcceptNewCall}`);
        } else {
          _.set(roomStatus, `${padId}.${userData.headerId}.acceptCall`, true);
          console.info(`unfortunately after ${retry} try, request must be terminate!`);
          acceptNewConnection({socket, padparticipators, padId, userData, target, callback, retry});
          callback(null, null, target);
        }
      }

      return cb(null, true);
    }),
    {afterProcessDelay: 2000}
);

/**
 * Handles an RTC Message
 * @param client the client that send this message
 * @param message the message from the client
 */
const handleRTCMessage = (socket, client, payload) => {
  // if(!socketIo) return false
  const userId = payload.from;
  const padId = payload.padId;
  const to = payload.to;

  const msg = {
    type: 'COLLABROOM',
    data: {
      type: 'RTC_MESSAGE',
      payload: {
        from: userId,
        to,
        data: payload.data,
      },
    },
  };
  socketIo.to(padId).emit('RTC_MESSAGE', msg);
};

module.exports.init = (io, {pid, namespace, preservedNamespace}) => {
  console.info(`Socket[${pid}] with namespace:${namespace} has loaded!`);
  socketIo = io;
  io.on('connection', (socket) => {
    console.info(`Client[${pid}] connected .. user ${socket.id} .. namespace ${namespace}`);

    socket.on('join pad', (padId, userId, callback) => {
      socket.ndHolder = {video: {}, text: {}};
      socket.ndHolder.video = {userId, padId};
      socket.ndHolder.text = {userId, padId};
      socket.join(padId);

      if (callback) callback(padId);
    });

    socket.on('acceptNewCall', (padId, headerId, callback) => {
      if (!_.get(roomStatus, `${padId}.${headerId}.acceptCall`, false)) {
        _.set(roomStatus, `${padId}.${headerId}.acceptCall`, true);
        console.info(`yup, avilable the room to accept new call. ${padId}.${headerId}.acceptCall`);
      }
      // console.log("new acceptCall ", padId, headerId, _.get(roomStatus, `${padId}.${headerId}.acceptCall`))
    });

    socket.on('userJoin', (padId, padparticipators, userData, target, callback) => {
      if (target === 'video') {
        q.push({socket, padId, padparticipators, userData, target, callback, retry: 0});
      } else {
        let room = null;
        if (target === 'text') {
          room = textChat.socketUserJoin(userData, padparticipators);
          _.set(socket, 'ndHolder.text', room.data);
        }

        if (room.canUserJoin) {
          socket.broadcast.to(padId).emit('userJoin', room.data, room.info, target);
          callback(room.data, room.info, target);
        } else {
          callback(null, room.info, target);
        }
      }
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
      const room = videoChat.getRoom(padId, headerId);
      if (room && room.length) room.map((user) => socket.broadcast.to(user.socketId).emit('userLatancy', {padId, headerId, userId, latency}));
      socket.emit('pongol', {padId, headerId, userId, latency});
    });

    socket.on('reloadVideoSession', (padId, headerId) => {
      io.to(padId).emit('reloadVideoSession', headerId);
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
        handleRTCMessage(socket, context.client, context.payload);
      }
    });

    socket.on('getVideoRoomInfo', (padId, headerId, callback) => {
      const result = videoChat.getRoom(padId, headerId);
      callback(result);
    });
  });
};
