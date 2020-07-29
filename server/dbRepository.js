const db = require('ep_etherpad-lite/node/db/DB');

exports.get = key => db.get(key).catch(error => {
	throw new Error("[repository]: set has an error," + error.message)
})

exports.set = (key, value) => db.set(key, value).catch(error => {
	throw new Error("[repository]: set has an error," + error.message)
})

exports.getLatestId = async key => {
	const result = await db.findKeys(key, ":*").catch(error => {
		throw new Error("[repository]: getLatestId has an error," + error.message)
	})

	return result.pop()
}