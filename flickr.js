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
  
  function getCallback(callback) {
    if (typeof callback === 'function') {
      return callback;
    } else if (typeof console === 'object' &&
               typeof console.log === 'function') {
      return function(response) {
        console.log(response);
      };
    }
  }
  
  function responseHandler(response, callback, params) {
    callback = getCallback(callback);
    if (typeof response === 'object') {
      if (response.photos &&
          response.photos.photo) {
        for (var i = 0; i < response.photos.photo.length; i++) {
          response.photos.photo[i] = new FlickrPhoto(self, response.photos.photo[i]);
        }
      } else if (response.photoset &&
                 response.photoset.photo) {
        for (var i = 0; i < response.photoset.photo.length; i++) {
          response.photoset.photo[i] = new FlickrPhoto(self, response.photoset.photo[i]);
        }
      }
      callback.apply(self, [response, params]);
    } else {
      callback.apply(self, [{
        stat: 'fail',
        code: -1,
        message: 'No response.'
      }, params]);
    }
  }
  
  function getParams(params, required) {
    if (typeof params === 'undefined') {
      return {};
    } else if (typeof params !== 'object' &&
        required.length === 1) {
      var key = required[0];
      var value = params;
      var params = {};
      params[key] = value;
      return params;
    } else {
      return params;
    }
  }
  
  function validateParams(method, params, required) {
    var missingParams = [], key;
    for (var i = 0; i < required.length; i++) {
      param = required[i];
      if (!params[param]) {
        missingParams.push(param);
      }
    }
    if (missingParams.length > 0 &&
        typeof console === 'object' &&
        typeof console.warn === 'function') {
      console.warn('Flickr API method ' + method +
                   ' requires: ' + missingParams.join(', '));
    }
  }
  
  function getUsage(method, required) {
    if (required.length === 0) {
      return 'Usage: ' + method + '(callback);';
    }
    var usage = 'Usage: ' + method + '({\n';
    var param;
    for (var i = 0; i < required.length; i++) {
      param = required[i];
      usage += '         ' + param + ': [' + param + ']';
      if (i < required.length - 1) {
        usage += ',';
      }
      usage += '\n';
    }
    usage += '       }, callback);';
    if (required.length === 1) {
      usage += '\n\n   Or: ' + method + '([' + param + '], callback);';
    }
    return usage;
  }
  
  function createMethod(method, required) {
    var methodWrapper = function(params, callback) {
      var settings = jQuery.extend(true, {}, ajaxSettings);
      settings.data.method = method;
      if (typeof params === 'function' &&
          required.length === 0) {
        callback = params;
        params = {};
      } else {
        params = getParams(params, required);
      }
      validateParams(method, params, required);
      jQuery.extend(settings.data, params);
      jQuery.ajax(settings).done(function(response) {
        responseHandler.apply(self, [response, callback, params]);
      });
    };
    methodWrapper.help = function() {
      if (typeof console === 'object' &&
          typeof console.info === 'function') {
        return console.info(getUsage(method, required));
      }
      return getUsage(method, required);
    };
    return methodWrapper;
  }
  
  function setup(context, baseMethod, methods) {
    var method;
    for (var key in methods) {
      method = baseMethod + '.' + key;
      if (typeof methods[key].length == 'number') {
        context[key] = createMethod(method, methods[key]);
      } else if (typeof methods[key] === 'object') {
        context[key] = {};
        setup(context[key], method, methods[key]);
      }
    }
  }
  
  setup(this, 'flickr', {
    cameras: {
      getBrandModels: ['brand'],
      getBrands: []
    },
    collections: {
      getTree: []
    },
    commons: {
      getInstitutions: []
    },
    contacts: {
      getPublicList: ['user_id']
    },
    favorites: {
      getContext: ['photo_id', 'user_id'],
      getPublicList: ['user_id']
    },
    galleries: {
      getInfo: ['gallery_id'],
      getList: ['user_id'],
      getListForPhoto: ['photo_id'],
      getPhotos: []
    },
    groups: {
      getInfo: ['group_id'],
      search: ['text'],
      discuss: {
        replies: {
          getInfo: ['topic_id', 'reply_id'],
          getList: ['topic_id']
        },
        topics: {
          getInfo: ['topic_id'],
          getList: ['group_id']
        }
      },
      pools: {
        getContext: ['photo_id', 'group_id'],
        getPhotos: ['group_id']
      }
    },
    interestingness: {
      getList: []
    },
    machinetags: {
      getNamespaces: [],
      getPairs: [],
      getPredicates: [],
      getRecentValues: [],
      getValues: ['namespace', 'predicate']
    },
    panda: {
      getList: [],
      getPhotos: ['panda_name']
    },
    people: {
      findByEmail: ['find_email'],
      findByUsername: ['username'],
      getInfo: ['user_id'],
      getPhotos: ['user_id'],
      getPhotosOf: ['user_id'],
      getPublicGroups: ['user_id'],
      getPublicPhotos: ['user_id']
    },
    photos: {
      getAllContexts: ['photo_id'],
      getContactsPublicPhotos: ['user_id'],
      getContext: ['photo_id'],
      getExif: ['photo_id'],
      getFavorites: ['photo_id'],
      getInfo: ['photo_id'],
      getRecent: [],
      getSizes: ['photo_id'],
      search: [],
      comments: {
        getList: ['photo_id']
      },
      geo: {
        getLocation: ['photo_id']
      },
      licenses: {
        getInfo: []
      },
      people: {
        getList: ['photo_id']
      }
    },
    photosets: {
      getContext: ['photo_id', 'photoset_id'],
      getInfo: ['photoset_id'],
      getList: [],
      getPhotos: ['photoset_id'],
      comments: {
        getList: ['photoset_id']
      }
    },
    places: {
      find: ['query'],
      findByLatLon: ['lat', 'lon'],
      getChildrenWithPhotosPublic: [],
      getInfo: [],
      getInfoByUrl: ['url'],
      getPlaceTypes: [],
      getShapeHistory: [],
      getTopPlacesList: ['place_type_id'],
      placesForBoundingBox: ['bbox'],
      placesForTags: ['place_type_id'],
      resolvePlaceId: ['place_id'],
      resolvePlaceURL: ['url'],
      tagsForPlace: []
    },
    reflection: {
      getMethodInfo: ['method_name'],
      getMethods: []
    },
    tags: {
      getClusterPhotos: ['tag', 'cluster_id'],
      getClusters: ['tag'],
      getHotList: [],
      getListPhoto: ['photo_id'],
      getListUser: ['user_id'],
      getListUserPopular: ['user_id'],
      getListUserRaw: ['user_id'],
      getRelated: []
    },
    test: {
      echo: []
    },
    urls: {
      getGroup: [],
      getUserPhotos: [],
      getUserProfile: [],
      lookupGallery: [],
      lookupGroup: [],
      lookupUser: []
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

FlickrPhoto.prototype.src = function(size, origFormat) {
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
    if (!origFormat) {
      origFormat = 'jpg';
    }
    return base + '_o.' + origFormat;
  } else {
    return base + '_' + size + '.jpg';
  }
};

