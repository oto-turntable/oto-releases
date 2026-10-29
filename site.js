/*
  Oto website: small improvements on top of a page that already works without JavaScript.

  1. Download button: asks GitHub for the newest release and points the button straight at its .zip (the file the
     read-me and the "First open" steps talk about; the .dmg only if there is no zip), with "Version X · N MB"
     under it. If GitHub says "no release yet" (404), is busy (rate limit), or the Mac is
     offline, nothing changes: the button keeps its plain link to the releases page.
  2. Tip jar: one button per https:// link in config.js (tipLinks, in order); otherwise "Tip jar opening soon".
  3. The swap video plays (muted, looping) only while it's on screen, and never by itself when the viewer has
     asked for reduced motion. A Pause / Play button is always there.
  4. A Copy button for the Terminal line.
  5. Report-a-problem links follow the repo in config.js.
*/
(function () {
  "use strict";

  var config = window.OTO_CONFIG || {};
  var REPO_PATTERN = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
  var repo = typeof config.repo === "string" && REPO_PATTERN.test(config.repo.trim()) ? config.repo.trim() : null;

  function each(selector, fn) {
    var list = document.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) fn(list[i]);
  }

  // ---------- 5. Links that follow config.repo ----------
  if (repo) {
    var base = "https://github.com/" + repo;
    each("[data-download]", function (a) { a.href = base + "/releases/latest"; });
    each('[data-repo-link="issues"]', function (a) { a.href = base + "/issues"; });
  }

  // ---------- 1. Download button ----------
  // The zip comes first: the read-me, the release notes and the steps on this page all say "unzip". (Opening Oto
  // straight from a disk image would run it from a read-only disk, where it can't update itself.)
  function pickAsset(assets) {
    var dmg = null, zip = null;
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (!a || typeof a.name !== "string" || typeof a.browser_download_url !== "string") continue;
      var name = a.name.toLowerCase();
      if (!zip && /\.zip$/.test(name)) zip = a;
      else if (!dmg && /\.dmg$/.test(name)) dmg = a;
    }
    return zip || dmg;
  }

  function showRelease(release) {
    if (!release || !Array.isArray(release.assets)) return;
    var asset = pickAsset(release.assets);
    if (!asset) return;
    var url = asset.browser_download_url;
    // Only ever point the button at a file on GitHub itself.
    if (!/^https:\/\/github\.com\/[^\s"'<>]+$/.test(url)) return;

    each("[data-download]", function (a) { a.href = url; });

    var parts = [];
    var tag = typeof release.tag_name === "string" ? release.tag_name.replace(/^v/i, "").trim() : "";
    if (tag && tag.length <= 20) parts.push("Version " + tag);
    if (typeof asset.size === "number" && asset.size > 0) {
      parts.push(Math.round(asset.size / 1000000) + " MB");   // MB as the Finder counts them (1,000,000 bytes)
    }
    if (parts.length) {
      each("[data-version]", function (p) {
        p.textContent = parts.join(" · ");
        p.hidden = false;
      });
    }
  }

  if (repo && typeof window.fetch === "function") {
    var controller = typeof window.AbortController === "function" ? new window.AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 8000) : null;
    var done = function () { if (timer) window.clearTimeout(timer); };
    window.fetch("https://api.github.com/repos/" + repo + "/releases/latest", {
      credentials: "omit",
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        // 404 = no release yet; 403 / 429 = GitHub's hourly limit. Either way: keep the plain link.
        if (!response.ok) throw new Error("GitHub answered " + response.status);
        return response.json();
      })
      .then(function (release) { done(); showRelease(release); })
      .catch(function () { done(); /* quietly keep the fallback link */ });
  }

  // ---------- 2. Tip jar ----------
  function safeTipUrl(value) {
    if (typeof value !== "string") return null;
    var text = value.trim();
    if (!/^https:\/\/[^\s"'<>]+$/i.test(text)) return null;
    try {
      var parsed = new URL(text);
      return parsed.protocol === "https:" && parsed.hostname ? parsed.href : null;
    } catch (e) {
      return null;
    }
  }

  // config.tipLinks: [{label, url}] in order; the first is the big button, the others are outlined. A link that isn't
  // https:// is skipped; a missing or over-long label reads "Send a coffee". Nothing valid = "opening soon" stays.
  var tipLinks = [];
  if (Array.isArray(config.tipLinks)) {
    for (var t = 0; t < config.tipLinks.length && tipLinks.length < 4; t++) {
      var item = config.tipLinks[t] || {};
      var url = safeTipUrl(item.url);
      if (!url) continue;
      var label = typeof item.label === "string" ? item.label.trim() : "";
      tipLinks.push({ url: url, label: label && label.length <= 24 ? label : "Send a coffee" });
    }
  }
  if (tipLinks.length) {
    each("[data-tip]", function (box) {
      var links = [];
      for (var i = 0; i < tipLinks.length; i++) {
        var link = document.createElement("a");
        link.className = "btn " + (i === 0 ? "btn-primary" : "btn-outline");
        link.href = tipLinks[i].url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = tipLinks[i].label;
        links.push(link);
      }
      if (box.replaceChildren) {
        box.replaceChildren.apply(box, links);
      } else {
        box.innerHTML = "";
        for (var j = 0; j < links.length; j++) box.appendChild(links[j]);
      }
    });
  }

  // ---------- 3. Swap video ----------
  var video = document.querySelector("[data-swap-video]");
  var toggle = document.querySelector("[data-video-toggle]");
  if (video && toggle && typeof video.play === "function") {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var userChoice = null;   // null = automatic; "play" / "pause" once the viewer has pressed the button
    var onScreen = false;

    video.controls = false;
    video.muted = true;
    toggle.hidden = false;

    var label = function () {
      toggle.textContent = video.paused ? "Play the video" : "Pause";
    };
    var tryPlay = function () {
      var p = video.play();
      if (p && typeof p.catch === "function") p.catch(function () { label(); });
    };
    var update = function () {
      var wantsPlay = userChoice ? userChoice === "play"
        : !(reduceMotion && reduceMotion.matches);
      if (wantsPlay && onScreen) tryPlay();
      else if (!video.paused) video.pause();
      label();
    };

    video.addEventListener("play", label);
    video.addEventListener("pause", label);
    toggle.addEventListener("click", function () {
      userChoice = video.paused ? "play" : "pause";
      if (userChoice === "play") tryPlay(); else video.pause();
      label();
    });
    if (reduceMotion && typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", update);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[entries.length - 1].isIntersecting;
        update();
      }, { threshold: 0.35 }).observe(video);
    } else {
      onScreen = true;
      update();
    }
    label();
  }

  // ---------- 4. Copy button ----------
  each("[data-copy]", function (button) {
    var source = document.getElementById(button.getAttribute("data-copy"));
    var status = document.querySelector("[data-copy-status]");
    if (!source || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") return;
    button.hidden = false;
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        button.textContent = "Copied";
        if (status) status.textContent = "Copied. Now paste it into Terminal and press Return.";
        window.setTimeout(function () { button.textContent = "Copy"; }, 2500);
      }, function () {
        if (status) status.textContent = "Couldn’t copy. Select the line and copy it by hand.";
      });
    });
  });
})();
