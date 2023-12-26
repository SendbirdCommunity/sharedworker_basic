//This is example of a function called from a different file
import { myFunction } from './example.js';
//Sendbird code is cut and pasted from github
//https://raw.githubusercontent.com/sendbird/sendbird-chat-sdk-javascript/main/sendbird.min.js
//In the copied code add "export" in front of  var Sendbird
import {Sendbird} from "./sendbirdchat.min.js";
//main thread port from the browser. Gets set in onconnect
let { SendbirdChat, GroupChannelModule, GroupChannelHandler, ConnectionHandler } = Sendbird

const appId = "YOUR_APP_ID";
const userId = "user_1";
const userToken = "";
let sb = null;

//This can be seen in the worker console.
//Worker console is visible here "chrome://inspect/#workers"
console.log(sb)

let port = null;
const connectedPorts = [];
let connections = 0;

//onconnect Comes with the ShardWorker API
onconnect = function(e) {
    console.log(e)
    port = e.ports[0];
    connections++;
    // With each new tab add a new port to the connectedPorts array
    connectedPorts.push(port);
    //Listening to messages from the main thread
    port.onmessage = async function(event) {
        //replies back to the main thread
        port.postMessage({ type: 'connected', count: connections });
        if (event.data === 'disconnect') {
            connections--;
        }
        //This is example of a function called from a different file
        myFunction();
        try {
            await initSendbird();
        } catch (e) {
            console.log(e);
        }
    };
};

// Broadcast a message to all connected tabs/windows
function broadcastMessage(message) {

    connectedPorts.forEach(port => {
        console.log("Broadcasting message to all connected ports");
        console.log(port)
        port.postMessage(message);
    });
}

const initSendbird = async () => {
    if(sb === null) {
        sb = SendbirdChat.init({
            appId,
            modules: [new GroupChannelModule()],
            localCacheEnabled: false
        });
        sb.addConnectionHandler("1", connectionHandler);
        addGroupChannelEventHandler(GroupChannelHandler, sb);
        //Now Start sending messages to the logged-in user. Use Postman or the Sendbird Dashboard
        const user = await sb.connect(userId, userToken);
        //This can be seen in the worker console.
        //Worker console is visible here chrome://inspect/#workers
        console.log("User successfully connected to Sendbird in a SharedWorker", user);
    } else {
        console.log("Sendbird already initialized");
        return
    }

}



const addGroupChannelEventHandler = (GroupChannelHandler, sbInstance) => {

    var channelHandler = new GroupChannelHandler({
        onMessageReceived: (channel, message) => {
            console.log("on message received - msg:", message);
            console.log("on message received - chn:", channel);
            broadcastMessage(message);

        },
        onMessageDeleted: (channel, message_id) =>
            console.log("on message deleted - msg_id:",
                message_id,
                "on message deleted - chn:",
                channel
            ),
        onChannelChanged: (channel) => console.log("channel changed:", channel),
        onUserLeft: (channel) => console.log("user left:", channel),
    });

    console.log("Added group channel handler")
    sbInstance.groupChannel.addGroupChannelHandler("1", channelHandler);
};

const connectionHandler = new ConnectionHandler({
    onConnected: () => {
        console.log("Connected");
    },
    onDisconnected: () => {
        console.log("Disconnected");
    },
    onReconnectStarted: () => {
        console.log("Reconnect Started");

    },
    onReconnectSucceeded: () => {
        console.log("Reconnect Succeeded");
    },
    onReconnectFailed: () => {
        console.log("Reconnect Failed");
    }
});






