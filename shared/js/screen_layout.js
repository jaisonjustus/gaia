/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * This script can identify the size and watch change of mediaquery.
 *
 * You can get current layout by calling |gerCurrentLayout|,
 * it will only return matching type from defaultQueries.
 *
 * You can use |watch| and |unwatch| to start/stop watch on specific
 * mediaquery string, such as tiny/small/medium/large, you can also
 * define your own watcher. After start watcher, this script
 * will dispatch 'screenlayoutchange' event and pass name and status.
 */

var ScreenLayout = {
  //Refer to famous libraries, like Twitter Bootstrap and Foundation
  //we choose 768, 992, 1200 width as our breakpoints
  defaultQueries: {
    tiny: '(max-width: 767px)',
    small: '(min-width: 768px) and (max-width: 991px)',
    medium: '(min-width: 992px) and (max-width: 1200px)',
    large: '(min-width: 1201px)'
  },

  init: function sl_init() {
    // loop defaultQueries and add window.matchMedia()
    // to this.queries object
    this.queries = (function(qs) {
      var result = {};
      for (var key in qs) {
        result[key] = window.matchMedia(qs[key]);
      }
      return result;
    })(this.defaultQueries);
  },

  getCurrentLayout: function sl_getCurrentLayout() {
    // return current matching type from "defaultQueries"
    for (var name in this.defaultQueries) {
      if (this.queries[name].matches) {
        return name;
      }
    }
    return false;
  },

  // name: |String|, ex: 'tiny', 'small', 'medium', 'large'
  // media: |String| optional, ex: '(max-width: 767px)'
  //
  // Start the |name| watcher
  // If |name| is not predefined in defaultQueries,
  // then |media| is required.
  //
  // If overwrite defaultQueries with new |media|,
  // |getCurrentLayout| will be also based on new config.
  watch: function sl_watch(name, media) {
    var mediaString = media || this.queries[name].media;
    if (!mediaString) {
      return;
    }
    this.unwatch(name);
    this.queries[name] = window.matchMedia(mediaString);
    this.queries[name].addListener(this);
  },

  unwatch: function sl_unwatch(name) {
    if (this.queries[name].media) {
      this.queries[name].removeListener(this);
    }
  },

  // Dispatch screenlayoutchange event, and pass mediaquery name and
  // status, which represent name of activating mediaquery and
  // activate status(boolean). ex: {name: 'small', status: true}
  handleChange: function sl_handleChange(evt) {
    for (var key in this.queries) {
      if (this.queries[key].media !== evt.media)
        continue;
      window.dispatchEvent(new CustomEvent('screenlayoutchange', {
        detail: {
          name: key,
          status: evt.matches
        }
      }));
    }
  }
};

ScreenLayout.init();