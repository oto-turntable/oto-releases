/*
  Oto website settings: the only file you need to edit.

  repo    The GitHub repository that holds the downloads ("name/oto-releases"). The Download button asks GitHub for
          the newest release here. To change it, run  python3 tools/website/set_repo.py newname/oto-releases
          from the project folder: it changes this line and the plain links in index.html together.
  tipUrl  The "Send me a coffee" tip link: a full web address starting with https:// . Leave it as "" until you have
          one. While it's empty the page shows a calm "Tip jar opening soon" instead of a button.
          Anything that doesn't start with https:// is ignored.
*/
window.OTO_CONFIG = {
  repo: "oto-turntable/oto-releases",
  tipUrl: "https://cash.app/$OtoApp"
};
