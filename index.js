const HyperExpress = require('hyper-express');
const webserver = new HyperExpress.Server();
var fs = require('fs');
const crypto = require('crypto');

const sse_streams = {};
function broadcast_message(message) {
    // Send the message to each connection in our connections object
    Object.keys(sse_streams).forEach((id) => {
        sse_streams[id].send(message);
    })
}

webserver.get('/listen', (request, response) => {
	response.set(
		'Content-Type','text/event-stream; charset=utf-8',
	  );
	if (response.sse) {
        // Looks like we're all good, let's open the stream
        response.sse.open();
        // OR you may also send a message which will open the stream automatically
        broadcast_message('Connection of user');
        
        // Assign a unique identifier to this stream and store it in our broadcast pool
        response.sse.id = crypto.randomUUID();
        sse_streams[response.sse.id] = response.sse;

		response.sse.send(response.sse.id)
        
        // Bind a 'close' event handler to cleanup this connection once it disconnects
        response.once('close', () => {
            // Delete the stream from our broadcast pool
            delete sse_streams[response.sse.id]
			broadcast_message('Deconnection of user');
        });
    } else {
        // End the response with some kind of error message as this request did not support SSE
        response.send('Server-Sent Events Not Supported!');
    }
})

webserver.post('/send', async (request, response) => {

	let body = await request.json();
	broadcast_message(body['msg'])
})

webserver.get('/*', (request, response) => {
	let path = "./src/" + request.path;

	if (path.endsWith("/")){
		path += "index.html"
	}
    
	fs.readFile(path, function(err, data) {
		if (err){
			return response.status(404).send()
		}
		else{
			return response.status(200).send(data)
		}
		
	})

})

webserver.listen(9000)