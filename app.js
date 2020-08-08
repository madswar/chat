const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
let iduser;
var clients = {};

const index = fs.readFileSync('./index.html', 'utf8');

const server = http.createServer((req, res) => {

   if (req.url == '/') {
     res.writeHead(200);
     res.end(index);
     iduser = 1;
   }
   else{
     console.log(req.url)
       res.writeHead(200);
       res.end(fs.readFileSync(`.${req.url}`, 'utf8'));
   }

   if(req.url == '/operator.html'){
     iduser = 2;
   }

});

const hostname = '127.0.0.1';

server.listen(8000, hostname, () => {
  console.log('Listen port 8000');
});

const ws = new WebSocket.Server({ server });

ws.on('connection', (connection, req) => {
  const ip = req.socket.remoteAddress;
  var id = Math.random();
  if(iduser == 2){
    id = id + 'a';
  }
  clients[id] = connection;
  connection.on('message', message => {
    message = JSON.parse(message)
        for (var key in clients) {
          if(key == id || key.indexOf("a") != -1 || key == message.idbl.toString().slice(4)){
             var mes = {key: id, message: message.messerv, idbl: message.idbl}
             mes = JSON.stringify(mes)
            clients[key].send(mes);
          }
        }
  });
  connection.on('close', () => {
    console.log(`Disconnected ${ip}`);
    for (var key in clients) {
      if(key.indexOf("a") != -1){
         var mes = {close: 'close', key: id}
         mes = JSON.stringify(mes)
        clients[key].send(mes);
      }
    }
    delete clients[id];
  });
});
