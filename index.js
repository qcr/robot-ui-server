require('dotenv').config();
const fs = require('fs');
const rosnodejs = require('rosnodejs');
const { RTCVideoSource, rgbaToI420 } = require('wrtc').nonstandard;
const { MediaStream } = require('wrtc');

const addon = require('bindings')('imgmsg2rgba');

const { Peer } = require('peerjs-on-node');

class Listener {
  constructor(nh, topic_name, message_type) {
    this.connections = [];
    nh.subscribe(topic_name, message_type, (msg) => this.handle(msg));
  }

  addConnection(conn) {
    this.connections.push(conn);
  }

  removeConnection(conn) {
    this.connections = this.connections.filter(function(value){ 
      return value !== conn;
    });
  }

  handle(msg) {
    this.connections.forEach(conn => conn.send(JSON.stringify(msg)));
  };
}

class MediaListener extends Listener {
  constructor(nh, topic_name, stream) {
    super(nh, topic_name, 'sensor_msgs/Image')

    this.source = new RTCVideoSource();
    this.track = this.source.createTrack();
    this.track.label = topic_name;
    stream.addTrack(this.track);
  }

  handle(msg) {
    try {
      const rgba = addon.imgmsg2rgba(msg);

      const i420Frame = {
        width: rgba.width,
        height: rgba.height,
        data: new Uint8ClampedArray(1.5 * rgba.width * rgba.height)
      };

      rgbaToI420(rgba, i420Frame);
    
      this.source.onFrame(i420Frame);
    } catch (err) {
      console.log(err.message)
    }
    //this.connections.forEach(conn => conn.send(JSON.stringify(msg)));
  };
}


(async function() {
  const text = fs.readFileSync('./topics.json', { encoding: 'utf-8' });
  const data = JSON.parse(text);

  const topics = data.topics;
  const video = data.video;

  const stream = new MediaStream(); 

  await rosnodejs.initNode('/my_node');
  const nh = rosnodejs.nh;

  const listeners = [];

  topics.forEach(topic => {
    listeners.push(new Listener(nh, topic.topic_name, topic.message_type))
  });

  video.forEach(topic_name => {
    listeners.push(new MediaListener(nh, topic_name, stream))
  });

  const secure = false;

  console.log(`Secure: ${secure}`)
  
  const host = secure ? 'platforms.qcr.ai' : 'localhost'
  const port = secure ? 443 : 9000;

  const config = secure ? {'iceServers': [
    { urls: 'stun:stun.cirrusrobotics.com.au:3478', username: process.env.TURN_USER, credential: process.env.TURN_PASS },
    { urls: 'turn:turn.cirrusrobotics.com.au:3478', username: process.env.TURN_USER, credential: process.env.TURN_PASS }
  ]} : {}

  var peer = new Peer(process.env.ID, { 
    host, port, path: '/', secure, config
  }); 

  peer.on('open', function() {
    console.log(`Listening as: ${process.env.NAME || process.env.ID}`);
  });

  peer.on('connection', function(conn) {

    console.log('Connection received');
    conn.on('open', () => {
      listeners.forEach(listener => listener.addConnection(conn));
      peer.call(conn.peer, stream); 
      console.log('Connection open');
    });
    conn.on('data', function(data){
      console.log(data);
    });
    conn.on('close', () => listeners.forEach(listener => {
      listener.removeConnection(conn);
    }));
  });
})();