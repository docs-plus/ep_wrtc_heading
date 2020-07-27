const socketSendText = (data, padId, callback) => {
	io.emit('updateTextChat', socket.username, data)
}

module.exports = {
	socketSendText,
	
}