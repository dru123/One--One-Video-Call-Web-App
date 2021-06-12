//create var nmae socketk
//inclue web socket library and get server from it
const Socket=require("websocket").server
const http=require("http");

//create server on the http object
const server=http.createServer((req,res)=>{})
//server to strt running->pass code no on which u want to run
server.listen(3000,()=>{
    console.log("Listening on port 3000");

})

///obj is created
const webSocket=new Socket({httpServer:server})


let users=[]//data of sender
//when ever new conn request to web server->req event is called
webSocket.on('request',(req)=>{
   
    //hold the conn of req->through this we can send data to requiste
    const connection=req.accept()
    //when conn send message 
   
    connection.on('message',(message)=>{
        //utf8 prop->has the string data  that conn sending
       
        const data=JSON.parse(message.utf8Data)
       
        const user=findUser(data.username)
        
        switch(data.type){
            case "store_user":
                  //some one want to enter with usser name tht already eexist so this check--bcz its not to be add in users arr..
                  if(user !=null){
                      return;//if user have already the same name
                  }
                    const newUser={
                    conn:connection,
                    username:data.username
                    }
                  users.push(newUser)
                   console.log(newUser.username)
                break
            case   "store_offer":
                if(user==null)
                     return
                  user.offer=data.offer;  
                   break
            case    "store_candidate":
                       if(user==null)//check user exist
                          return

                     //multiple candidate can come here so we store in an arr only the valid one
                     if(user.candidates==null)//fresh user
                        user.candidates=[]

                     user.candidates.push(data.candidate)
                     break   
            case   "send_answer" :
                if(user==null){
                    return
                }
                //send answer only to the person who is trying to call
                sendData
                ({
                    type:"answer",
                    answer:data.answer
                },user.conn)
                 break
            case "send_candidate"   : 
                 if(user==null){
                return
                   }
                  //send answer only to the person who is trying to call
                  sendData
                  ({
                    type:"candidate",
                   candidate:data.candidate
                 },user.conn)//sending answer to semder..
                    break  
             case "join_call":
                if(user==null){
                    return
                       }
                 sendData({
                     type:"offer",
                     offer:user.offer
                 },connection)      
                 user.candidates.forEach(candidate=>{
                     sendData({
                         type:"candidate",
                         candidate:candidate
                     },connection)
                 })
                 break
               case "close_conn" :
                   {
                        stop();
                   } 

        }
    })
function stop(){
connection.on('close',(reason,description)=>{
    users.forEach(user=>{
        if(user.conn==connection){
            users.splice(users.indexOf(user),1)
            return
        }
    })
})}
})


function sendData(data,conn){
    conn.send(JSON.stringify(data))
}
function findUser(username){
    for(let i=0;i<users.length;i++){
        if(users[i].username==username)
            return users[i];
    }
}