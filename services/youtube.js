const { google } = require('googleapis')

const youtubeClient = google.youtube('v3')

const authKey = process.env.YOUTUBEKEY

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getChannelLiveStreams () {
  return youtubeClient.search.list({
    key: authKey,
    part: 'snippet',
    channelId: 'UCQvTDmHza8erxZqDkjQ4bQQ',
    eventType: 'live',
    type: 'video'
  })
}

async function getVideoData (id) {
  return youtubeClient.videos.list({
    key: authKey,
    part: 'liveStreamingDetails',
    id: id
  })
}

async function listen (messageReceivedCallback) {
  try {
    let data = {}

    let liveStreamData = (await getChannelLiveStreams()).data
    data['videoID'] = liveStreamData.items[0].id.videoId

    let videoData = (await getVideoData(data.videoID)).data
    data['liveChatID'] = videoData.items[0].liveStreamingDetails.activeLiveChatId

    let requestObject = {
      key: authKey,
      part: 'snippet,authorDetails',
      maxResults: '200',
      liveChatId: data['liveChatID']
    }

    let nextPageToken = null

    while (true) {
      let reqObj = Object.assign({}, requestObject)

      if (nextPageToken) reqObj['pageToken'] = nextPageToken

      let chatData = (await youtubeClient.liveChatMessages.list(reqObj)).data
      nextPageToken = chatData.nextPageToken

      if (chatData.items.length > 0) {
        chatData.items.forEach(item => {
          messageReceivedCallback({
            user: item.authorDetails.displayName,
            content: item.snippet.displayMessage,
            service: 'youtube'
          })
        })
      }

      await sleep(chatData.pollingIntervalMillis)
    }
  } catch (error) {
    console.log('[YouTube] Error in chat listener. Restarting in 30 seconds.', error)
    await sleep(30000)
    listen(messageReceivedCallback)
  }
}

module.exports.listen = (messageReceivedCallback) => {
  listen(messageReceivedCallback)
}
