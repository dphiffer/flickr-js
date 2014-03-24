flickr.js
---------

A basic JavaScript wrapper for the Flickr API. Only implements methods that don't require authentication.

Requirements
============

* [jQuery](https://jquery.com/download/)
* [Flickr API key](https://www.flickr.com/services/apps/create/apply/)

Usage
=====

```js
var apiKey = '...';
var flickr = new Flickr(apiKey);
flickr.photos.search({
    tags: 'cat'
}, function(response) {
    var first = response.photos.photo[0];
    $('body').append('<img src="' + first.src('b') + '">');
});
```

See also
========

* [Flickr API documentation](https://www.flickr.com/services/api/)
