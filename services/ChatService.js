class ChatService {
  constructor(interval = 1000) {
    this.statusCheckTimer = setInterval(() => {}, interval)
  }
}
