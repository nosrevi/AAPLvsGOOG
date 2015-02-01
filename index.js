var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/sound', express.static(__dirname + '/sound'));
//app.configure(function () {
//    app.use(express.cookieParser());
//    app.use(express.bodyParser());
//    app.use('/public', express.static(__dirname + '/public'));
//    app.use(app.router);    
//});
var online = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  online += 1;
  console.log('a user connected');
  io.emit('online',{msg: online});
  socket.on('start', function(data){
    io.sockets.emit('started',{msg: 'started'});
    console.log(data);
  });
  socket.on('disconnect', function(){
    online -= 1;
    io.sockets.emit('online',{msg: online});
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
