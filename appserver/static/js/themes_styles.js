require([
  "jquery",
  "splunkjs/mvc",
  "splunkjs/mvc/simplexml/ready!"
], function ($, mvc) {

  // If you do NOT see this log in browser console, the JS file is not loading (path/permissions/cache).
  console.log("themes_dashboard.js loaded");

  // IMPORTANT: Put real DOM placeholders inside <html> panels:
  // <html><div id="themes_list"></div></html>
  // <html><div id="favorites_list"></div></html>

  var PREF_KEY = "favorite_theme";

  // Use user-prefs app scope (this is where user-prefs.conf is managed).
  var service = mvc.createService({ app: "user-prefs" });

  var themesData = [
    { id: "theme1", name: "Dark Mode" },
    { id: "theme2", name: "Light Mode" },
    { id: "theme3", name: "Blue Ocean" },
    { id: "theme4", name: "Green Forest" },
    { id: "theme5", name: "Cyber Punk" }
  ];

  function safeParseArray(str) {
    try {
      var v = JSON.parse(str);
      return (Object.prototype.toString.call(v) === "[object Array]") ? v : [];
    } catch (e) {
      return [];
    }
  }

  function getFavoritesFromPrefs(prefs) {
    // prefs shape differs by SDK method; handle defensively
    try {
      if (prefs && prefs.entry && prefs.entry[0] && prefs.entry[0].content && prefs.entry[0].content[PREF_KEY]) {
        return safeParseArray(prefs.entry[0].content[PREF_KEY]);
      }
    } catch (e) {}
    return [];
  }

  function renderThemes(favorites) {
    var $el = $("#themes_list");
    if ($el.length === 0) {
      console.warn("Missing #themes_list element. Put <div id=\"themes_list\"></div> inside your <html> panel.");
      return;
    }

    var htmlParts = [];
    for (var i = 0; i < themesData.length; i++) {
      var t = themesData[i];
      var isFav = favorites.indexOf(t.id) > -1;
      var icon = isFav ? "★" : "☆";
      var cls = isFav ? "favorite-btn favorited" : "favorite-btn";
      htmlParts.push(
        '<button class="' + cls + '" data-theme-id="' + t.id + '" id="btn_' + t.id + '">' +
          t.name + " " + icon +
        "</button>"
      );
    }

    $el.html(htmlParts.join(" "));

    // Minimal inline styles so it looks OK even without CSS file
    $(".favorite-btn").css({
      padding: "10px 12px",
      margin: "6px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      cursor: "pointer",
      background: "#f3f4f6"
    });
    $(".favorite-btn.favorited").css({
      background: "#22c55e",
      color: "#fff",
      borderColor: "#16a34a"
    });
  }

  function renderFavorites(favorites) {
    var $el = $("#favorites_list");
    if ($el.length === 0) {
      console.warn("Missing #favorites_list element. Put <div id=\"favorites_list\"></div> inside your <html> panel.");
      return;
    }

    if (!favorites || favorites.length === 0) {
      $el.html('<div style="color:#6b7280;padding:14px;">No favorites yet. Mark some themes above!</div>');
      return;
    }

    // Map IDs -> names (only those that exist)
    var nameById = {};
    for (var i = 0; i < themesData.length; i++) nameById[themesData[i].id] = themesData[i].name;

    var li = [];
    for (var j = 0; j < favorites.length; j++) {
      var id = favorites[j];
      var nm = nameById[id] || id;
      li.push('<li style="padding:10px 12px;margin:8px 0;border-radius:8px;background:rgba(34,197,94,0.12);border-left:4px solid #22c55e;">' + nm + "</li>");
    }

    $el.html('<ul style="list-style:none;padding:0;margin:0;">' + li.join("") + "</ul>");
  }

  function loadFavorites(callback) {
    // Try the MVC helper first (if available in your build)
    if (service.userPrefs && typeof service.userPrefs === "function") {
      service.userPrefs().fetch({}, function (err, prefs) {
        if (err) {
          console.error("userPrefs fetch error:", err);
          callback([]);
          return;
        }
        callback(getFavoritesFromPrefs(prefs));
      });
      return;
    }

    // Fallback: use configs endpoint for user-prefs.conf (stanza general_default)
    // GET /servicesNS/<user>/user-prefs/configs/conf-user-prefs/general_default?output_mode=json
    service.request(
      "configs/conf-user-prefs/general_default",
      "GET",
      { output_mode: "json" },
      null,
      null,
      function (err, res) {
        if (err) {
          console.error("REST prefs fetch error:", err);
          callback([]);
          return;
        }
        try {
          var entry = res && res.data && res.data.entry && res.data.entry[0];
          var content = entry && entry.content ? entry.content : {};
          callback(content[PREF_KEY] ? safeParseArray(content[PREF_KEY]) : []);
        } catch (e) {
          callback([]);
        }
      }
    );
  }

  function saveFavorites(favorites, done) {
    var payload = {};
    payload[PREF_KEY] = JSON.stringify(favorites);

    if (service.userPrefs && typeof service.userPrefs === "function") {
      service.userPrefs().update(payload, function (err) {
        if (err) console.error("userPrefs save error:", err);
        if (done) done(!err);
      });
      return;
    }

    // Fallback REST update to stanza
    service.request(
      "configs/conf-user-prefs/general_default",
      "POST",
      { output_mode: "json" },
      payload,
      null,
      function (err) {
        if (err) console.error("REST prefs save error:", err);
        if (done) done(!err);
      }
    );
  }

  function refreshUI() {
    loadFavorites(function (favorites) {
      renderThemes(favorites);
      renderFavorites(favorites);
    });
  }

  function toggleFavorite(themeId) {
    loadFavorites(function (favorites) {
      var idx = favorites.indexOf(themeId);
      if (idx > -1) favorites.splice(idx, 1);
      else favorites.push(themeId);

      saveFavorites(favorites, function () {
        refreshUI();
      });
    });
  }

  // Click handler (event delegation)
  $(document).on("click", ".favorite-btn", function () {
    var themeId = $(this).attr("data-theme-id");
    if (themeId) toggleFavorite(themeId);
  });

  // Initial render
  refreshUI();
});
