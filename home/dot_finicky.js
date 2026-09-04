// @ts-check
/**
 * @type {import('finicky').Configuration}
 */

const Base64 = {
  characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  decode(string) {
    const chars = Base64.characters;
    let result = "";
    let i = 0;
    do {
      const b1 = chars.indexOf(string.charAt(i++));
      const b2 = chars.indexOf(string.charAt(i++));
      const b3 = chars.indexOf(string.charAt(i++));
      const b4 = chars.indexOf(string.charAt(i++));
      const a = ((b1 & 0x3f) << 2) | ((b2 >> 4) & 0x3);
      const b = ((b2 & 0xf) << 4) | ((b3 >> 2) & 0xf);
      const c = ((b3 & 0x3) << 6) | (b4 & 0x3f);
      result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : "") + (c ? String.fromCharCode(c) : "");
    } while (i < string.length);
    return result;
  },
};

function getSubdomains(hostname) {
  const regexParse = new RegExp("[a-z\\-0-9]{2,63}\\.[a-z\\.]{2,5}$");
  const urlParts = regexParse.exec(hostname);
  return hostname.replace(urlParts[0], "").slice(0, -1);
}

function getSearchParamByName(search, name) {
  const regex = new RegExp(`${name.replace(/[[\\]]/g, "\\$&")}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(search);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export default {
  defaultBrowser: "Orion",
  options: {
    hideIcon: false,
    urlShorteners: [
      "adf.ly", "bit.do", "bit.ly", "buff.ly", "deck.ly", "fur.ly", "goo.gl", "is.gd", "mcaf.ee", "ow.ly", "spoti.fi",
      "su.pr", "t.co", "tiny.cc", "tinyurl.com",
      // Custom
      "go.pardot.com", "tiny.amazon.com", "youtu.be",
      "ksm0ltly.r.us-east-1.awstrack.me", "jzj2f9rm.r.us-east-1.awstrack.me", "orange.hosting.lsoft.com", "buff.ly"
    ],
  },

  handlers: [
    { match: (url) => url.protocol === "quip:", browser: "Quip" },
    { match: (url) => url.protocol === "chime:", browser: "Amazon Chime" },
    { match: finicky.matchHostnames("github.com"), browser: "Firefox" },
    { match: finicky.matchHostnames("open.spotify.com"), browser: "Spotify" },

    // Apple ID logins
    {
      match: ["*.setapp.com/*", "setapp.com/*", "appleid.apple.com", "id.logi.com", "logitech.com"],
      browser: "Safari",
    },

    // Prefer Safari over Orion
    { match: ["*.dropbox.com/*", "*.getpocket.com/*", "*.grammarly.com/*", "*.zoom.us/*"], browser: "Safari" },
    { match: ["*.canva.com/*"], browser: "Brave Browser" },
  ],

  rewrite: [
    {
      match: ["*www.amazon.*"],
      url(url) {
        const allowedKeys = ["k", "i"];
        const search = url.search
          .replace(/^\?/, "")
          .split("&")
          .map((p) => p.split("="))
          .filter(([key]) => allowedKeys.some((start) => key.startsWith(start)));
        url.search = search.map((p) => p.join("=")).join("&");
        return url;
      },
    },
    {
      match: () => true,
      url(url) {
        const removeKeysStartingWith = ["utm_", "uta_"];
        const removeKeys = ["fblid", "gclid"];
        const search = url.search
          .replace(/^\?/, "")
          .split("&")
          .map((p) => p.split("="))
          .filter(([key]) => !removeKeysStartingWith.some((s) => key.startsWith(s)))
          .filter(([key]) => !removeKeys.includes(key));
        url.search = search.map((p) => p.join("=")).join("&");
        return url;
      },
    },
    {
      match: (url) => url.protocol === "http:" && url.host !== "localhost",
      url(url) {
        url.protocol = "https:";
        return url;
      },
    },
    {
      match: ["*.wikipedia.org/*"],
      url(url) {
        const wiki_page = url.pathname.split("/").pop();
        const lang = getSubdomains(url.host).split(".")[0];
        url.host = "www.wikiwand.com";
        url.pathname = `/${lang}/${wiki_page}`;
        return url;
      },
    },
    {
      match: finicky.matchHostnames(["chime.aws", "app.chime.aws"]),
      url(url) {
        url.host = "";
        url.search = `pin=${url.pathname.substring(1)}`;
        url.pathname = "meeting";
        url.protocol = "chime:";
        return url;
      },
    },
    {
      match: /^https?:\/\/www\.amazon\.com\/gp\/r.html/,
      url(url) {
        return new URL(decodeURIComponent(getSearchParamByName(url.search, "U")));
      },
    },
    {
      match: finicky.matchHostnames(["click.pstmrk.it"]),
      url(url) {
        const newUrl = new URL("https://" + decodeURIComponent(url.pathname.split("/")[2]));
        return newUrl;
      },
    },
    {
      match: finicky.matchHostnames(["mandrillapp.com"]),
      url(url) {
        const decoded = Base64.decode(url.search.substring(2));
        return new URL(JSON.parse(JSON.parse(decoded).p).url);
      },
    },
    {
      match: finicky.matchHostnames([
        "www.anrdoezrs.net",
        "www.jdoqocy.com",
        "www.kqzyfj.com",
        "www.tkqlhce.com",
        "www.avantlink.com",
        "go.skimresources.com",
        "go.redirectingat.com",
        "www.dpbolvw.net",
      ]),
      url(url) {
        return new URL(decodeURIComponent(getSearchParamByName(url.search, "url")));
      },
    },
    {
      match: finicky.matchHostnames([
        "redirect.viglink.com",
        /.*\.evyy.net$/,
        "goto.target.com",
        "belkin.evyy.net",
      ]),
      url(url) {
        return new URL(decodeURIComponent(getSearchParamByName(url.search, "u")));
      },
    },
    {
      match: finicky.matchHostnames(["www.ojrq.net"]),
      url(url) {
        return new URL(decodeURIComponent(getSearchParamByName(url.search, "return")));
      },
    },
  ],
};
