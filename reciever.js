//web socket allow fullduplex communication(In full-duplex , both client can transmit and receive simultaneously)
//once a client and server connection establish the server cansend data back and forth continously
//without having client to make a any further connection request
const webSocket=new WebSocket("ws://192.168.0.101:3000");//pass the string url of socket server


//any message from erver to websocket
webSocket.onmessage=(event)=>{
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch(data.type){
        case "offer"://on the basis of offer reciever genrtes answer
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()

            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}
 function createAndSendAnswer(){
     //on the response too offer anser genrate nd send to sserver
     peerConn.createAnswer((answer)=>{
         peerConn.setLocalDescription(answer)
         sendData({
             type:"send_answer",
             answer:answer
         })
     },error=>{
         console.log(error);
     })
 }




//next task->send username to server and server store the username

function sendData(data){
     data.username=username;
     webSocket.send(JSON.stringify(data))//require string as parameter;(data obj->string)
}
//manage ->start call function
let localStream
let username;
let peerConn;
function joinCall(){

    document.getElementById("local-video")
    .style.display = "block";
    document.getElementById("remote-video")
    .style.display = "block";
   
    document.querySelector(".dis")
    .style.display = "none";
   document.getElementById("button1")
    .style.display = "block";
    document.getElementById("button2")
    .style.display = "block";
    document.getElementById("button3")
    .style.display = "block";
    document.getElementById("username-input").style.display="none";
    document.getElementById("callbtn").style.display="none";


    username=document.getElementById("username-input").value
    document.getElementById("video-call-div").style.display="block";
    document.querySelector("body").style.background="#202124";
    document.getElementById("button4")
    .style.display = "block";
    document.getElementById("button5")
    .style.display = "block";
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
        // 
        //   }
        peerConn.onaddstream=(e)=>{
         document.getElementById("remote-video").srcObject=e.stream
          
           
          }
          if(  localStream.getVideoTracks()[0].enabled==false){
              console.log("hey")
            document.querySelector("local-video").style. background= "white";
          peerConn.onaddstream=(e)=>{
              
              document.getElementById("remote-video").style.background="blue"}
        }
  
          //when candidate key created ->funnc runa
      //candidate store in server ->remote user get these key thorugh server ->thn connection hhpn

           peerConn.onicecandidate=((e)=>{
                     if(e.candidate==null)
                     return

               sendData({
                   type:"send_candidate",//send candidate to the  user(sender) through the server
                   candidate:e.candidate
               })      
           })
        //we tell the server we want to join the call so the server send the offer and icecandidate of sender..(through the user name)
       
          sendData({
              type:"join_call"
          })


        }).
        catch(function (error){
             alert("please allow both microphone and camera");
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
        let sender=peerConn.getSenders().find(function(s){
            return s.track.kind==videoTrack.kind
        

        })

        sender.replaceTrack(videoTrack)
    }) .catch((err)=>{
   console.log("unable to display"+err)

       
    })
     
}

function stopShare(){
    console.log("hi");
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