const app = getApp();

var message = require('../../component/message/message');
const recorder = require('../../utils/recorder.js');
//微信小程序新录音接口，录出来的是aac或者mp3，这里要录成mp3
// const mp3Recorder = wx.getRecorderManager();
const mp3RecoderOptions = {
  duration: 15000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3'
}

Page({
  data: {
    isplaying: false,//是否正在播放语音
    speakingPicIndex: 1,//帧动画初始图片 
    isSpeaking: false,//是否正在说话
    outputTxt: "", //输出识别结果
    talkList: [],
    scrollTop: 0,
    lastId: '0'
  },
  onLoad: function () {
    var that = this;
    this.recorder = new recorder.Recorder({
      duration: 15000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
      stop: this.translate,
      endPlay: this.endPlay
    });
    // mp3Recorder.onStart(() => {
    //   console.info('录音开始');
    // })
    // mp3Recorder.onStop((res) => {
    //   this.src = res.tempFilePath;
    //   var list = this.data.talkList;
    //   list.push({ id: list.length + '', src: res.tempFilePath, isPlaying: false, sign: 1 });
    //   this.setData({
    //     talkList: list,
    //     lastId: list.length - 1
    //   });
    //   this.translate(res.tempFilePath);
    //   console.info('录音结束');
    // });

    // this.innerAudioContext = wx.createInnerAudioContext();
    // this.innerAudioContext.onError((res) => {
    //   // 播放音频失败的回调

    // });
    // this.innerAudioContext.onPlay((res) => {
    //   console.info('播放中');
    // });
    // this.innerAudioContext.onEnded((res) => {
    //   debugger
    //   var list = this.data.talkList;
    //   // list[this.qindex].isPlaying = false;
    //   this.setData({
    //     talkList: list
    //   });
    //   console.info('播放完');
    // });

    message.show.call(that, {
      content: '网络开小差了',
      icon: 'offline',
      duration: 3000
    })
  },

  startRecord: function () {
    this.speaking();
    this.setData({
      isSpeaking: true
    });
    this.recorder.startRecord();
    // mp3Recorder.start(mp3RecoderOptions);
  },

  playVideo(e) {
    debugger
    console.info(123);
    var dataset = e.target.dataset;
    if (dataset.voice) {
      // this.innerAudioContext.src = e.target.dataset.voice; // 这里可以是录音的临时路径
      // this.innerAudioContext.play();
      this.recorder.play(dataset.voice);
      if (dataset.index > -1) {

        var list = this.data.talkList;
        // list[this.qindex || 0].isPlaying = false;
        // list[dataset.index].isPlaying = true;
        this.qindex = dataset.index;
        this.setData({
          talkList: list
        });
      }
    }


  },

  endRecord: function () {
    this.setData({
      isSpeaking: false,
    });
    clearInterval(this.timer)
    debugger
    this.recorder.stopRecord();
  },
  translate(src) {
    console.info(this);
    var that = this;
    this.src = src;
    var list = this.data.talkList;
    list.push({ id: list.length + '', src: src, isPlaying: false, sign: 1 });
    this.setData({
      talkList: list,
      lastId: list.length - 1
    });
    wx.showToast({
      title: '识别中',
      icon: 'loading',
      duration: 60000,
      mask: true
    });
    wx.uploadFile({
      url: 'https://m.ctrip.com/restapi/soa2/12904/json/WordQuestionAsync',
      filePath: src,
      name: 'voice',
      header: {
        "Content-Type": "application/json"
      },
      success(res) {
        var data = JSON.parse(res.data);
        if (!data.IsSuccessful) {
          wx.showToast({
            title: '抱歉,识别失败',
            icon: 'none',
            duration: 2000,
            mask: true
          });
          return;
        }
        console.log(data);
        var list = that.data.talkList;
        list.push({
          id: list.length + '',
          word: data.Word,
          Answer: data.Answer,
          sign: 2,
          isPlaying: false,
          src: data.WavBase64
        });
        that.setData({
          talkList: list,
          lastId: list.length - 1
        });     
        that.recorder.play(data.WavBase64);
        // $this.setData({
        //   Response: {
        //     Question: data.Question,
        //     World: data.Word,
        //     Language: data.Language,
        //     Answer: data.Answer,
        //     WavBase64: data.WavBase64
        //   }
        // });
        // $this.playAnswer();
      },
      fail: function (res) {
        console.log(res)
        setTimeout(function () {
          wx.showToast({
            title: '识别失败，请换个重试',
            icon: 'loading',
            duration: 1000
          });
        }, 2000);
      },
      complete: function () {
        wx.hideToast();
        // $this.setData({
        //   duration: 15,
        //   recAnimation: {},
        //   contentAnimation: {}
        // });
      }
    });

  },

  endPlay: function () {
    console.info(this);
    var list = this.data.talkList;
    list[this.qindex].isPlaying = false;
    this.setData({
      talkList: list
    });
  },
  // 获取hei的id节点然后屏幕焦点调转到这个节点
  toBottom: function () {
    debugger;
    var query = wx.createSelectorQuery();
    query.select('#hei').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].bottom  // #the-id节点的下边界坐标
      })
      res[1].scrollTop // 显示区域的竖直滚动位置
    });
  },
  //麦克风帧动画 
  speaking: function () {
    var _this = this;
    //话筒帧动画 
    var i = 1;
    this.timer = setInterval(function () {
      i++;
      i = i % 5;
      _this.setData({
        speakingPicIndex: i
      })
    }, 200);
  },
  chooseApple() {
    debugger
    this.setData({
      isRight: 'yes'
    });
  }
})
