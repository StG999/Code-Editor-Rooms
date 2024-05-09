const  express= require("express");
const app = express();
const path = require("path");
const http = require("http");
const {Server}= require("socket.io");
const ACTIONS = require("./src/Actions");
const exp = require("constants");
const server = http.createServer(app);
const io = new Server(server);
const usersocketmap ={};

app.use(express.static("build"));
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
})

function getallconnectedclients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId)|| []).map(
        (socketid)=>{
            return{
                socketid,
                username:usersocketmap[socketid],
            }
        }
    )
}

io.on("connection",(socket)=>{
    console.log("abhay");
    console.log("socket connected", socket.id);
socket.on(ACTIONS.JOIN , ({roomId,username})=>{
usersocketmap[socket.id]=username;
socket.join(roomId);
const clients = getallconnectedclients(roomId);
clients.forEach(({socketid}) =>{
    io.to(socketid).emit(ACTIONS.JOINED,{
        clients,
        username,
        sockedid:socket.id,
    })
})
})

socket.on("disconnecting",()=>{
    const rooms = [...socket.rooms];
    rooms.forEach((roomId)=>{
        socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
            socketid:socket.id,
            username:usersocketmap[socket.id],
        })
    })
    delete usersocketmap[socket.id];
    socket.leave();
})

socket.on(ACTIONS.CODE_CHANGE ,({roomId,code})=>{
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code});
}
)

socket.on(ACTIONS.SYNC_CODE,({code,socketId})=>{
    io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code});
})


});

const PORT = process.env.port||5000;
server.listen(PORT,()=> console.log(`   listening on port ${PORT} `));
