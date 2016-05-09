using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace Movie_Night_Trivia
{
    public class GameHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }

        public void SendReadyMsg(string name, int score, string connID)
        {
            Clients.Client(connID).broadcastReady("ready", score);
           //Clients.Others.broadcastMessage("ready", score);
        }

        public void JoinSession(string sessionID, string connID, string myName)
        {
            Clients.Others.broadcastSession(sessionID, connID, myName);
        }

        public void AcknowledgeConnection(string myConnID, string p2ConnID, string myName)
        {
            Clients.Client(p2ConnID).broadcastAcknowledge(myConnID, myName);
        }
    }
}