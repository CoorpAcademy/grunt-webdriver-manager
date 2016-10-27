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
    method: 'GET',
    webdriverVersions: {
        selenium: '2.44.0',
        chromedriver: '2.12',
        iedriver: '2.44.0'
    }
}
```

## Roadmap
 * Improve documentation
 * Refactor code to externalize webdriver-manager to standalone package
 * Improve package corrumption detection based on size
 * Test on Windows

## Release History
 * v1.0.0   deploy on tags and download chrome driver x64 architecture
 * v0.0.9   remove console.log
 * v0.0.8   support background with & https://www.maketecheasier.com/run-bash-commands-background-linux/
 * v0.0.7   -d (daemon) flag on cli start command
 * v0.0.6   Allow change webdriver versions with configuration
 * v0.0.5   Fix issue loading x32 chrome driver on x64 host
 * v0.0.4   Fix issue on return result of update method
 * v0.0.3   Fix issue in grunt async context
 * v0.0.2   Add license MIT
 * v0.0.1   First release with driver download support and selenoum server start

---

Task submitted by [Loïc Calvy](http://about.me/loic.calvy)

