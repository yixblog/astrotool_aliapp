const app = getApp();

Page({
  data: {
    showLocationMenu: false
  },
  onLoad(query) {
    this.loadSharingLocations(query.lat, query.lon)
  },
  loadSharingLocations(lat, lon) {
    let thisPage = this;
    app.requestWithAuth({
      url: app.rootLinks.shared_locations.href,
      data: { lat: lat, lon: lon },
      method: 'GET',
      success: data => {
        let sharedLocations = data.data.locations;
        thisPage.setData({ shared_locations: sharedLocations })
      }
    })
  },
  closeLocationMenu() {
    this.setData({
      showLocationMenu: false
    });
  },
  displayNavOperations(env) {
    console.debug('list item clicked', env);
    let clickedLocation = this.data.shared_locations[env.index];
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
      setting: {
        gestureEnable: 1,
        showScale: 1,
        showCompass: 1,
        tiltGesturesEnabled: 0,
        trafficEnabled: 0,
        showMapText: 1
      }
    }
    this.setData({
      map: map,
      showLocationMenu: true,
      activeLocation: clickedLocation
    });

  },
  addMyLocation() {
    let lnks = this.data.activeLocation.links.filter(lnkItem => lnkItem.rel === 'add_from');
    if (!lnks.length) {
      return;
    }
    let lnk = lnks[0];
    app.requestWithAuth({
      url: lnk.href,
      method: 'POST',
      success: res => {
        my.alert({
          title: '添加成功',
          content: '添加共享地理位置成功，返回后请点击刷新加载'
        });
        my.navigateBack({

        });
      }
    })
  },
});
