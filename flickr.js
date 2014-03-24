function Flickr(init) {
  
  var ajaxSettings = {
    url: 'https://api.flickr.com/services/rest/',
    data: {
      format: 'json'
    },
    dataType: 'jsonp',
    jsonp: false,
    jsonpCallback: 'jsonFlickrApi'
  };
  
  if (typeof init === 'string') {
    ajaxSettings.data.api_key = init;
  } else if (typeof init === 'object') {
    jQuery.extend(ajaxSettings, init);
  }
  
  var self = this;
  
  function createMethod(method, handler) {
    var settings = jQuery.extend(true, {}, ajaxSettings);
    settings.data.method = method;
    return function(args, callback) {
      jQuery.extend(settings.data, args);
      jQuery.ajax(settings).done(function(response) {
        handler.apply(self, [callback, response, args]);
      });
    };
  }
  
  function setup(context, baseMethod, methods) {
    var method;
    for (var key in methods) {
      method = baseMethod + '.' + key;
      if (typeof methods[key] === 'function') {
        context[key] = createMethod(method, methods[key]);
      } else if (typeof methods[key] === 'object') {
        context[key] = {};
        setup(context[key], method, methods[key]);
      }
    }
  }
  
  function getCallback(callback) {
    if (typeof callback === 'function') {
      return callback;
    } else if (typeof console === 'object' &&
               typeof console.log === 'function') {
      return console.log;
    }
  }
  
  function genericHandler(callback, response, args) {
    callback = getCallback(callback);
    if (typeof response === 'object') {
      callback.apply(self, [response, args]);
    } else {
      callback.apply(self, [{
        stat: 'fail',
        code: -1,
        message: 'No response.'
      }, args]);
    }
  }
  
  function photosHandler(callback, response, args) {
    if (typeof response === 'object' &&
        response.photos &&
        response.photos.photo) {
      for (var i = 0; i < response.photos.photo.length; i++) {
        response.photos.photo[i] = new FlickrPhoto(self, response.photos.photo[i]);
      }
      callback = getCallback(callback);
      callback.apply(self, [response, args]);
    } else if (typeof response === 'object' &&
               response.photoset &&
               response.photoset.photo) {
      for (var i = 0; i < response.photoset.photo.length; i++) {
        response.photoset.photo[i] = new FlickrPhoto(self, response.photoset.photo[i]);
      }
    } else {
      genericHandler(callback, response, args);
    }
  }
  
  setup(this, 'flickr', {
    cameras: {
      getBrandModels: genericHandler,
      getBrands: genericHandler
    },
    collections: {
      getTree: genericHandler
    },
    commons: {
      getInstitutions: genericHandler
    },
    contacts: {
      getPublicList: genericHandler
    },
    favorites: {
      getContext: genericHandler,
      getPublicList: genericHandler
    },
    galleries: {
      getInfo: genericHandler,
      getList: genericHandler,
      getListForPhoto: genericHandler,
      getPhotos: photosHandler
    },
    groups: {
      getInfo: genericHandler,
      search: genericHandler,
      discuss: {
        replies: {
          getInfo: genericHandler,
          getList: genericHandler
        },
        topics: {
          getInfo: genericHandler,
          getList: genericHandler
        }
      },
      pools: {
        getContext: genericHandler,
        getPhotos: photosHandler
      }
    },
    interestingness: {
      getList: photosHandler
    },
    machinetags: {
      getNamespaces: genericHandler,
      getPairs: genericHandler,
      getPredicates: genericHandler,
      getRecentValues: genericHandler,
      getValues: genericHandler
    },
    panda: {
      getList: genericHandler,
      getPhotos: photosHandler
    },
    people: {
      findByEmail: genericHandler,
      findByUsername: genericHandler,
      getInfo: genericHandler,
      getPhotos: photosHandler,
      getPhotosOf: photosHandler,
      getPublicGroups: genericHandler,
      getPublicPhotos: photosHandler
    },
    photos: {
      getAllContexts: genericHandler,
      getContactsPublicPhotos: photosHandler,
      getContext: genericHandler,
      getExif: genericHandler,
      getFavorites: genericHandler,
      getInfo: genericHandler,
      getRecent: photosHandler,
      getSizes: genericHandler,
      search: photosHandler,
      comments: {
        getList: genericHandler
      },
      geo: {
        getLocation: genericHandler
      },
      licenses: {
        getInfo: genericHandler
      },
      people: {
        getList: genericHandler
      }
    },
    photosets: {
      getContext: genericHandler,
      getInfo: genericHandler,
      getList: genericHandler,
      getPhotos: photosHandler,
      comments: {
        getList: genericHandler
      }
    },
    places: {
      find: genericHandler,
      findByLatLon: genericHandler,
      getChildrenWithPhotosPublic: genericHandler,
      getInfo: genericHandler,
      getInfoByUrl: genericHandler,
      getPlaceTypes: genericHandler,
      getShapeHistory: genericHandler,
      getTopPlacesList: genericHandler,
      placesForBoundingBox: genericHandler,
      placesForTags: genericHandler,
      resolvePlaceId: genericHandler,
      resolvePlaceURL: genericHandler,
      tagsForPlace: genericHandler
    },
    reflection: {
      getMethodInfo: genericHandler,
      getMethods: genericHandler
    },
    tags: {
      getClusterPhotos: genericHandler,
      getClusters: genericHandler,
      getHotList: genericHandler,
      getListPhoto: genericHandler,
      getListUser: genericHandler,
      getListUserPopular: genericHandler,
      getListUserRaw: genericHandler,
      getRelated: genericHandler
    },
    test: {
      echo: genericHandler
    },
    urls: {
      getGroup: genericHandler,
      getUserPhotos: genericHandler,
      getUserProfile: genericHandler,
      lookupGallery: genericHandler,
      lookupGroup: genericHandler,
      lookupUser: genericHandler
    }
  });
}

function FlickrPhoto(flickr, values) {
  jQuery.extend(this, values);
  var self = this;
  this.getInfo = function(callback) {
    flickr.photos.getInfo({
      photo_id: self.id
    }, callback);
  };
  Object.call(this);
}

FlickrPhoto.prototype.src = function(size = null, origFormat = 'jpg') {
  /*
  
  http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
	  or
  http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
    or
  http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
  
  */
  var base = 'http://farm' + this.farm +
             '.staticflickr.com/' + this.server +
             '/' + this.id +
             '_' + this.secret;
  if (!size) {
    return base + '.jpg';
  } else if (size === 'o') {
    return base + '_o.' + origFormat;
  } else {
    return base + '_' + size + '.jpg';
  }
};

