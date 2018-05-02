const mp3Recorder = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
class Recorder{
  constructor(options){
    this.options = options;
    mp3Recorder.onStart(() => {
      console.info('录音开始');
    });
    mp3Recorder.onStop((res) => {
      console.info('录音结束');
      this.mp3 = res.tempFilePath;
      this.options.stop();

    });
    innerAudioContext.onError((res) => {
      // 播放音频失败的回调

    });
    innerAudioContext.onPlay((res) => {
      console.info('播放中');
    });
    innerAudioContext.onEnded((res) => {
      console.info('播放完');

    });
  }
  startRecord(){
    mp3Recorder.start(this.options);
  }
  stopRecord(){
    mp3Recorder.stop();
  }
  paly(){
    innerAudioContext.play();
  }
  getMp3File(){
    return this.getMp3File;
  }
  setMp3File(src){
    this.mp3 = src;
  }
}

module.exports.Recorder = Recorder;