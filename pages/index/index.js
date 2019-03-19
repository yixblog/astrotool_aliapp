const app = getApp();

Page({
  onLoad() {
    app.requestWithAuth({
      url: app.host,
      method:'GET',
      success:(res)=>{
        for(let link of res.data.links){
          app.rootLinks[link.rel] = link;
        }
        if(app.rootLinks.locations){
          my.redirectTo({
            url: '/pages/locations/locations'
          });
        }
      }
    })
  },
});
