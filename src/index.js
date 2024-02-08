const notificationTemplate = require("./adaptiveCards/notification-default.json");
const { notificationApp } = require("./internal/initialize");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { TeamsBot } = require("./teamsBot");
const restify = require("restify");
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nApp Started, ${server.name} listening to ${server.url}`);
});

server.post(
  "/api/notification",
  restify.plugins.queryParser(),
  restify.plugins.bodyParser(),
  async (req, res) => {
    const pageSize = 100;
    let continuationToken = undefined;
    const { title, appName, description, url, userId } = req.body;
    do {
      const pagedData = await notificationApp.notification.getPagedInstallations(
        pageSize,
        continuationToken
      );
      const installations = pagedData.data;
      continuationToken = pagedData.continuationToken;

      for (const target of installations) {
        let useridt=target.conversationReference.user.id;
        if(useridt == userId) {
          console.log('==got it==');
          await target.sendAdaptiveCard(
         
            AdaptiveCards.declare(notificationTemplate).render({
              title: title || "Default Title",
              appName: appName || "Default App Name",
              description: description || "Default Description",
              notificationUrl: url || "https://www.canva.com/",
            })
          );
        }
       
      }
    } while (continuationToken);

    res.json({});
  }
);

const teamsBot = new TeamsBot();
server.post("/api/messages", async (req, res) => {
  await notificationApp.requestHandler(req, res, async (context) => {
    await teamsBot.run(context);
  });
});
