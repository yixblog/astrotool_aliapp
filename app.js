App({
  host:"https://miniapp.yixastro.com",
  rootLinks:{},
  authPromise:[],
  onLaunch(options) {
    this.checkAuth();
  },
  onShow(options) {
    
  },
  checkAuth(completeCallback){
    let thisApp = this;
    if(!this.authToken){
      my.getAuthCode({
        success: (res) => {
          let code = res.authCode;
          console.log('auth code:'+code);
          my.request({
            url: thisApp.host+'/auth/aliapp/login', // 目标服务器url
            method:'POST',
            contentType:'application/json',
            data:{code:code},
            success: (res) => {
              thisApp.authToken = res.data.token;
              if(typeof completeCallback=='function'){
                completeCallback();
              }
              for(let promise of thisApp.authPromise){
                promise();
              }
            },
            fail: (res)=>{
              my.alert({content:'服务暂不可用，请联系开发者'})
            }
          });
        },
      });
    }
  },
  requestWithAuth(requestObj){
    let thisApp = this;
    function process(){
      requestObj.headers = requestObj.headers||{};
      requestObj.headers['x-auth-token'] = thisApp.authToken;
      requestObj.fail = (res)=>{
        if(res.status==401){
          thisApp.checkAuth(()=>{
            thisApp.requestWithAuth(requestObj);
          })
        }else{
          if(res.data){
            my.alert({
              title:res.data.error_code,
              content:res.data.message
            });
          }else{
            my.alert({title:'HTTP ERROR',content:'网络错误:'+res.status})
          }
        
        }
      };
      my.request(requestObj);
    }
    if(this.authToken){
      process();
    }else{
      this.addAuthPromise(process)
    }
  },
  addAuthPromise(func){
    this.authPromise.push(func);
  }
  
});
