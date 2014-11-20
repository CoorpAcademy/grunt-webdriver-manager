[![Build Status](https://travis-ci.org/CoorpAcademy/grunt-webdriver-manager.svg?branch=master)](https://travis-ci.org/CoorpAcademy/grunt-webdriver-manager)

grunt-webdriver-manager
=======================

A grunt and cli package to manage selenium and webdriver download



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-webdriver-manager');
```




## Web Driver Manager task
_Run this task with the `grunt webdrivermanager` command._


### Settings

There are a number of options available.

#### out_dir
Type: `String`
Default: './selenium'

Path of file download storage.

Example:
```js
webdrivermanager: {
  out_dir: './selenium',
  capabilities: {
    browserName: 'chrome'
  },
  seleniumArgs: [],
  seleniumPort: 4444,
  ignore_ssl: false,
  proxy: false,
  method: 'GET'
}
```

## Release History

 * v0.0.1   First release with driver download support and selenoum server start

---

Task submitted by [Loïc Calvy](http://about.me/loic.calvy)

