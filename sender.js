//web socket allow fullduplex communication(In full-duplex , both client can transmit and receive simultaneously)
//once a client and server connection establish the server cansend data back and forth continously
//without having client to make a any further connection request
const webSocket=new WebSocket("ws://192.168.0.101:3000");//pass the string url of socket server


//any message from server to websocket

//  we sent our offer and ice candidate->server.......now agr koi dursa connect hona chyga wo apna offer and candidate 
//bjega server k through (on message event call) wo hum (Sender) k peer conn m store krayge ->so conn setup....
webSocket.onmessage=(event)=>{
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch(data.type){
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

// function isOpen(ws) { return ws.readyState === ws.OPEN }


let username;


//next task->send username to server and server store the username

function  sendUsername(){

     username=document.getElementById("username-input").value;
    //send user name -> function accept an object..
    sendData({
        type:"store_user",
    })
}
function sendData(data){
    // if (!isOpen(socket)) return;
// socket.send(JSON.stringify(data));
     data.username=username;
     webSocket.send(JSON.stringify(data))//require string as parameter;(data obj->string)
}
//manage ->start call function
let localStream
let peerConn;
function startCall(){
   
    document.getElementById("local-video")
    .style.display = "block";
    document.getElementById("remote-video")
    .style.display = "block";
    document.getElementById("button1")
    .style.display = "block";
    document.getElementById("button2")
    .style.display = "block";
    document.getElementById("button3")
    .style.display = "block";
    
    document.querySelector(".dis")
    .style.display = "none";
    document.querySelector(".call-action-div ")
    .style.display = "block";
    document.querySelector("body").style.background="#202124";
    document.getElementById("button4")
    .style.display = "block";
    document.getElementById("button5")
    .style.display = "block";
    document.getElementById("video-call-div").style.display="inline";
    document.getElementById("button6")
    .style.display = "block";
  let userpromise=   navigator.mediaDevices.getUserMedia({
        video:{
            frameRate:24,//no of frame appear in a second
            width:{
                min:480,ideal:720,max:1280
            },
            aspectRatio:1.33333//describe the ratio bw height and width of stream
              },
        audio:true

    })
    userpromise.then(function  (stream){
       
            localStream=stream
            document.getElementById("local-video").srcObject=localStream
 //   create a peer connection  ->attach  local stream bcz when some other connect to our peer thn this stream avaialbrlr 
 //to that person  using webrtc api
 //The RTCPeerConnection() constructor returns a newly-created RTCPeerConnection, which represents a connection between the local device and a remote peer.
       
          let configuration={
              iceServers:[
                  {
                      "urls":["stun:stun.l.google.com:19302",
                      "stun:stun1.l.google.com:19302",
                      "stun:stun2.l.google.com:19302"]
                  }

              ]
          }
 
 
 
        peerConn=new RTCPeerConnection(configuration)
          peerConn.addStream(localStream)
          
          //when this peer conn . with other guy then the callback functn will be called onaddstream
          peerConn.onaddstream=(e)=>{
              document.getElementById("remote-video").srcObject=e.stream}
             
            

          //jese hi oferr create hota h peer connn ice candidate ko gather krna strt kr deta h or server m store kra deta h 
      //jb bhi kooi dursa bnda connect hona chtha h wo server s hmare candidate lkr ek peer conn setup ho jata hmare bich

           peerConn.onicecandidate=((e)=>{//3
                     if(e.candidate==null)
                     return
//on icecandiate bar bar call hoga jb jb candidate milegaa or hume use server m store krwana hoga..
               sendData({
                   type:"store_candidate",
                   candidate:e.candidate
               })      
           })
          
       
          //sender->offer->server->whensomeone connect->ansewer send ->sender k peer m store hoge
          createAndSendOffer()//2
        


        }).
        catch(function (error){
             alert("please allow both microphone and camera");
        })
    

}


function createAndSendOffer(){
    //retrun promise when offer gnerate then function run nd senddata
//as soon as offercreated peerconn.. also strt gathering ice candidate keys 
//then these candidate sent to server -> when user connect they get candidate thrugh server-> then by using candaite conn. hppn
    peerConn.createOffer((offer)=>{
              sendData({
                  type:"store_offer",//server->sender k ofoer store krega 
                  offer:offer
              })
    peerConn.setLocalDescription(offer)
    },(error)=>{
        console.log(error);
    })
}




let isAudio=true;
function  muteAudio(){
    isAudio=!isAudio
    //return all the  array  of audio which our stream is playing

    localStream.getAudioTracks()[0].enabled=isAudio  
    document.querySelector("#button2").innerHTML=`<i class="fas fa-microphone-alt-slash"></i>`;
    

    if(isAudio==true){
        document.querySelector("#button2").innerHTML=`<i class="fas fa-microphone-alt"></i>`;
    }
}

let isVideo=true
function muteVideo(){
    isVideo=!isVideo
    localStream.getVideoTracks()[0].enabled=isVideo
    document.querySelector("#button1").innerHTML=` <i class="fas fa-video-slash"></i>`
   
  if(isVideo==true){
    document.querySelector("#button1").innerHTML=` <i class="fas fa-video"></i>`
  }

}
let sender
function shareScreen(){
    navigator.mediaDevices.getDisplayMedia({
         video:{
             cursor:"always"
         },
         audio:{
             echoCancellation:true,
             noiseSuppression:true,
         }
    }).then((stream)=>{
        let videoTrack=stream.getVideoTracks()[0];
         sender=peerConn.getSenders().find(function(s){
            return s.track.kind==videoTrack.kind
        

        })

        sender.replaceTrack(videoTrack)
    }) .catch((err)=>{
   console.log("unable to display"+err)

       
    })
     
}
function stopShare(){
     navigator.mediaDevices.getUserMedia({
        video:{
            frameRate:24,//no of frame appear in a second
            width:{
                min:480,ideal:720,max:1280
            },
            aspectRatio:1.33333//describe the ratio bw height and width of stream
              },
        audio:true

    })
    .then( (stream)=>{
    let FaceTrack=stream .getVideoTracks()[0];
         sender=peerConn.getSenders().find(function(s){
            return s.track.kind==FaceTrack.kind
        

        })

        sender.replaceTrack(FaceTrack)
    
    }) .catch((err)=>{
        console.log("unable to get Video"+err)
     
            
         })
     
}
   function leaveMeeting(){
   

          sendData({
            type:"close_conn",
       })  
       window.location.reload();
  
}
    function getFullscreenElement(){
        return document.fullscreenElement
         ||document.webkitFullscreenElement
          ;  
        }

document.getElementById("button6").addEventListener("dblclick", ()=> {
    fullScreen();
  });
  function fullScreen(){
      if(getFullscreenElement()){
        document.getElementById("remote-video").style.height="640px";
          document.exitFullscreen();
      }
      else{
          document.documentElement.requestFullscreen().catch(console.log);
          document.getElementById("remote-video").style.height="830px";
      }
  }