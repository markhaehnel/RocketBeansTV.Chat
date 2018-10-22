const { google } = require('googleapis')

const youtubeClient = google.youtube('v3')
const authKey = process.env.YOUTUBEKEY

async function listenYoutubeChat (messageReceivedCallback) {
  const { data } = await youtubeClient.search.list({
    key: authKey,
    part: 'snippet',
    channelId: 'UCQvTDmHza8erxZqDkjQ4bQQ',
    eventType: 'live',
    type: 'video'
  })

  // get live chat id
  let response = await youtubeClient.videos.list({
    key: authKey,
    part: 'liveStreamingDetails',
    id: data.items[0].id.videoId
  })

  requestYoutubeMessages(messageReceivedCallback, response.data.items[0].liveStreamingDetails.activeLiveChatId)
}

async function requestYoutubeMessages (messageReceivedCallback, liveChatID, nextPageToken) {
  let requestObject = {}

  if (nextPageToken) {
    // nextPageToken defines from where to look for new messages.
    requestObject = {
      key: authKey,
      part: 'snippet,authorDetails',
      maxResults: '200',
      pageToken: nextPageToken,
      liveChatId: liveChatID
    }
  } else {
    // Withouth nextPageToken, get the last 200 results.
    requestObject = {
      key: authKey,
      part: 'snippet,authorDetails',
      maxResults: '200',
      liveChatId: liveChatID
    }
  }
  // Use the defined array for the request
  let { data } = await youtubeClient.liveChatMessages.list(requestObject)

  // Capture current time for a cooldown required later
  nextPageToken = data.nextPageToken

  // YouTube API gives us a certain time we have to wait before requesting again
  let timeout = data.pollingIntervalMillis
  if (data.items.length > 0) {
    data.items.forEach(item => {
      messageReceivedCallback({
        user: item.authorDetails.displayName,
        content: item.snippet.displayMessage,
        service: 'youtube'
      })
    })
  }

  // Wait until we are allowed to request again
  setTimeout(() => requestYoutubeMessages(messageReceivedCallback, liveChatID, nextPageToken), timeout)
}

module.exports.listen = (messageReceivedCallback) => {
  listenYoutubeChat(messageReceivedCallback)
}
