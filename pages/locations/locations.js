const app = getApp();

Page({
  data: {
    showLocationMenu: false
  },
  links: {},
  onLoad() {
    console.debug('locations onload')
    
  },
  onReady(){
    console.debug('locations onready')
    this.loadMyLocations();
  },
  loadMyLocations(){
    let pageThis = this;
    app.requestWithAuth({
      url: app.rootLinks.locations.href,
      method: 'GET',
      success: (res) => {
        let locations = res.data.locations;
        for (let location of locations) {
          let longitudeSymbol = location.longitude > 0 ? 'E' : 'W';
          let latitudeSymbol = location.latitude > 0 ? 'N' : 'S';
          location.position = location.longitude.toFixed(4) + longitudeSymbol + ',' + location.latitude.toFixed(4) + latitudeSymbol;
          location.arrow = true;
        }
        pageThis.setData({ locations: locations, showLocationMenu: false });
        for (let link of res.data.links) {
          pageThis.links[link.rel] = link;
        }
      }
    })
  },
  displayNavOperations(env) {
    console.debug('list item clicked', env);
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
      setting: {
        gestureEnable: 1,
        showScale: 1,
        showCompass: 1,
        tiltGesturesEnabled: 0,
        trafficEnabled: 0,
        showMapText: 1
      }
    }
    clickedLocation.editname = false;
    this.setData({
      map: map,
      showLocationMenu: true,
      activeLocation: clickedLocation
    });

  },
  editNameClick() {
    this.setData({
      'activeLocation.editname': true
    })
  },
  quitEditName() {
    this.setData({
      'activeLocation.editname': false
    })
  },
  addLocation() {
    let thisPage = this;
    my.chooseLocation({
      success: (res) => {
        app.requestWithAuth({
          url: thisPage.links.add_location.href,
          method: 'POST',
          contentType: 'application/json',
          data: res,
          success: () => thisPage.onLoad()
        })
      }
    })
  },
  showSharedLocations() {
    my.getLocation({
      success: locate => {
        my.navigateTo({
          url: '/pages/shared_locations/shared_locations?lat=' + locate.latitude + '&lon=' + locate.longitude
        })
      },
      fail: res => {
        my.navigateTo({
          url: '/pages/shared_locations/shared_locations'
        })
      }
    })

  },

  closeLocationMenu() {
    this.setData({
      showLocationMenu: false
    });
  },
  openSevenTimer() {
    let lnks = this.data.activeLocation.links.filter(lnkItem => lnkItem.rel === '7timer');
    if (!lnks.length) {
      return;
    }
    let thisPage = this;
    let lnk = lnks[0];
    my.navigateTo({
      url: '/pages/seventimer/seventimer?lnk=' + encodeURIComponent(lnk.href) + '&name=' + this.data.activeLocation.name,
      complete: () => {
        thisPage.closeLocationMenu();
      }
    })
  },
  shareLocation() {
    let lnks = this.data.activeLocation.links.filter(lnkItem => lnkItem.rel === 'modify_share');
    if (!lnks.length) {
      return;
    }
    let lnk = lnks[0]
    let pageThis = this;
    let curShareFlag = this.data.activeLocation.shareFlag;
    if (!curShareFlag) {
      my.confirm({
        title: '提示',
        content: '共享地理位置意味着其他用户可以添加当前地点到自己的地点列表',
        success: res => {
          if (res.confirm) {
            modifyShareFlag();
          }
        }
      })
    } else {
      modifyShareFlag();
    }

    function modifyShareFlag() {
      console.info('modify share flag to:' + !curShareFlag)
      app.requestWithAuth({
        url: lnk.href,
        method: 'POST',
        data: { share: !curShareFlag },
        success: res => {
          pageThis.loadMyLocations()
          pageThis.setData({
            'activeLocation.shareFlag': !curShareFlag
          })
        }
      })
    }

  },
  deleteLocation() {
    let lnks = this.data.activeLocation.links.filter(lnkItem => lnkItem.rel === 'del');
    if (!lnks.length) {
      return;
    }
    let lnk = lnks[0];
    let pageThis = this;
    my.confirm({
      title: '警告',
      content: '删除地点后无法找回，只能重新添加，确认继续？',
      success: res => {
        if (res.confirm) {
          app.requestWithAuth({
            url: lnk.href,
            method: 'POST',
            success: res => pageThis.loadMyLocations()
          })
        }
      }
    })

  },
  submitNewName(evt) {
    let lnks = this.data.activeLocation.links.filter(lnkItem => lnkItem.rel === 'editname');
    if (!lnks.length) {
      return;
    }
    let newName = evt.detail.value;
    if (!newName.length) {
      my.alert({ content: '新名称不能为空' });
      return;
    }
    let lnk = lnks[0];
    let pageThis = this;
    app.requestWithAuth({
      url: lnk.href,
      method: 'POST',
      contentType: 'application/json',
      data: { name: newName },
      success: (res) => {
        pageThis.setData({
          'activeLocation.name': newName
        })
      }
    })
  },

});
