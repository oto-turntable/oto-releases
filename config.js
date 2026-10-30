/*
  Oto website settings: the only file you need to edit.

  repo      The GitHub repository that holds the downloads ("name/oto-releases"). The Download button asks GitHub for
            the newest release here. To change it, run  python3 tools/website/set_repo.py newname/oto-releases
            from the project folder: it changes this line and the plain links in index.html together.
  tipLinks  The "Send me a coffee" buttons, in order: the first is the big one, the rest are outlined. Each has a
            label (what people read on the button, up to 24 characters) and a url (a full web address starting with
            https://). A button whose url doesn't start with https:// is skipped. An empty list [] shows a calm
            "Tip jar opening soon" instead. Oto's own "Send Me a Coffee…" menu item opens this page's tip section,
            so changing a button here changes it for the app too, no new Oto version needed.
  suggestUrl  The "Send a suggestion" button in the Suggestions section: the address of a form (or any https:// page)
            where people can write to you. The same rule as the tip buttons: a full web address starting with https://
            — anything else is skipped. Set to the "Oto suggestions" form made for you on 2026-10-29 (its fill-in
            address, the one ending in /viewform — never the form's edit page). If it is ever "" the section offers to
            open a new issue on GitHub instead (the repo above), which needs a free GitHub account. Oto's own "Send a
            Suggestion…" menu item (since 0.14.8) opens this section, so changing the form here reaches every copy of
            Oto from 0.14.8 on at once, no new Oto version needed.
*/
window.OTO_CONFIG = {
  repo: "oto-turntable/oto-releases",
  tipLinks: [
    { label: "PayPal or card", url: "https://ko-fi.com/otoapp" },
    { label: "Cash App", url: "https://cash.app/$OtoApp" }
  ],
  suggestUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf59KmTYLY85IOoHUAx51y72OqlCt9Ev2Q5lSANLBBXSaMuqg/viewform"
};
