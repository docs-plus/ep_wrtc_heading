const db = require('ep_etherpad-lite/node/db/DB');
const settings = require('ep_etherpad-lite/node/utils/Settings');
console.log(settings.dbType, settings.dbSettings, "=-=--=-=-=-=")

try {
	db.init();
} catch (error) {
	console.error(`exception thrown: ${e.message}`);
  if (e.stack) console.log(e.stack);
}

exports.get = (key) => db.get(key).catch((error) => {
  throw new Error(`[repository]: set has an error,${error.message}`);
});

exports.set = (key, value) => db.set(key, value).catch((error) => {
  throw new Error(`[repository]: set has an error,${error.message}`);
});

exports.getLatestId = async (key) => {
  const result = await db.findKeys(key, ':*').catch((error) => {
    throw new Error(`[repository]: getLatestId has an error,${error.message}`);
  });
  return result.length ? Number(result.pop().split(':').pop()) : 0;
};


exports.getLastMessages = async (key, lastMessageId, {limit, offset}) => {
  const results = [];
  const rowOfIds = [];

  // pagination
  let startPoint = lastMessageId;
  let endPoint = 1;

  if (lastMessageId > limit) {
    startPoint = lastMessageId - offset;
    endPoint = startPoint - limit;
  }

  for (let id = startPoint; id >= endPoint; id--) rowOfIds.push(id);

  rowOfIds.reverse().map((id) => results.push(db.get(`${key}:${id}`)));

  return Promise.all(results);
};
