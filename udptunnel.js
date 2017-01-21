var Buffer = require('buffer').Buffer;
var dgram = require('dgram');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8888});

//The ip &amp; port of the udp server
var SERVER_IP = 'localhost'
var SERVER_PORT = 2222

wss.on('connection', function(ws) {
  //Create a udp socket for this websocket connection
  var udpClient = dgram.createSocket('udp4');
  var first = true;

  //console.log('New connection...')

  udpClient.on('listening', function() {
    //console.log("UDP Socket ready...");
    //When a message is received from ws client send it to udp server.

    //When a message is received from udp server send it to the ws client
    udpClient.on('message', function(msg, rinfo) {
        //console.log('<', msg);
        try{
          ws.send(msg, {binary: true});
        }catch(e){
          udpClient.close()
        }
    });

    ws.on('message', function(message) {
      var msgBuff = new Buffer(message);
      if(first) {
        first = false;
        if(msgBuff.length === 10 &&
            msgBuff.readInt32LE(0) === -1 &&
            msgBuff.toString('utf8', 4, 8) === 'port') {
          //console.log("Skipping port message");
          return
        }
      }
      //console.log('>', msgBuff, msgBuff.length);
      udpClient.send(msgBuff, 0, msgBuff.length, SERVER_PORT, SERVER_IP);
    });
  });

  udpClient.bind()
})
