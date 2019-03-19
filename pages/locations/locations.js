const app = getApp();

Page({
  data: {
    showLocationMenu: false
  },
  links:{},
  onLoad() {
    let pageThis = this;
    app.requestWithAuth({
      url:app.rootLinks.locations.href,
      method:'GET',
      success:(res)=>{
        let locations = res.data.locations;
        for(let location of locations){
          let longitudeSymbol = location.longitude>0?'E':'W';
          let latitudeSymbol = location.latitude>0?'N':'S';
          location.position = location.longitude.toFixed(4)+longitudeSymbol+','+location.latitude.toFixed(4)+latitudeSymbol;
          location.arrow=true;
        }
        pageThis.setData({locations:locations});
        for(let link of res.data.links){
          pageThis.links[link.rel]=link;
        }
      }
    })
  },
  displayNavOperations(env){
    console.debug('list item clicked',env);
    let clickedLocation = this.data.locations[env.index];
    let map = {
      longitude: clickedLocation.longitude,
      latitude: clickedLocation.latitude,
      scale: 14,
      markers: [{
        id: clickedLocation.location_id,
        longitude: clickedLocation.longitude,
        latitude: clickedLocation.latitude,
        iconPath: '/images/icon-location.png'
      }],
      setting:{
        gestureEnable:1,
        showScale:1,
        showCompass:1,
        tiltGesturesEnabled:0,
        trafficEnabled:0,
        showMapText:1
      }
    }
    this.setData({
      map: map,
      showLocationMenu: true,
      activeLocation: clickedLocation
    });
    
  },
  addLocation(){
    let thisPage = this;
    my.chooseLocation({
      success:(res)=>{
        app.requestWithAuth({
          url:thisPage.links.add_location.href,
          method:'POST',
          contentType:'application/json',
          data:res,
          success:()=>thisPage.onLoad()
        })
      }
    })
  },
  closeLocationMenu(){
    this.setData({
      showLocationMenu: false
    });
  },
  handleLocationAction(evt){
    console.log("location action fired:",evt);
    let dataSet = evt.target.dataset;
    let thisPage = this;
    my.navigateTo({
      url:'/pages/seventimer/seventimer?lnk='+encodeURIComponent(dataSet.link)+'&name='+this.data.activeLocation.name,
      complete:()=>{
        thisPage.closeLocationMenu();
      }
    })
  }
});
