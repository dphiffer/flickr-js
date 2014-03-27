flickr.js
=========

A simple JavaScript wrapper for the Flickr API. Only implements methods that don't require authentication. Uses jQuery
and JSONP to retrieve data.

Requirements
------------

* [jQuery](https://jquery.com/download/)
* [Flickr API key](https://www.flickr.com/services/apps/create/apply/)

Usage
-----

```js
var apiKey = '...';
var flickr = new Flickr(apiKey);
flickr.photos.search({
    tags: 'cat'
}, function(response) {
    var first = response.photos.photo[0];
    var src = first.src('b'); // 'b' is an image size (1024 on longest side)
    var href = first.href();
    $('body').append('<a href="' + href + '"><img src="' + src + '"></a>');
});
```

Designed for the JavaScript Console
-----------------------------------

![Screenshot of Firebug JavaScript Console](https://raw.githubusercontent.com/dphiffer/flickr-js/master/console.jpg)

See also
--------

* [Flickr API documentation](https://www.flickr.com/services/api/)
* [Image URLs explained](https://www.flickr.com/services/api/misc.urls.html)
