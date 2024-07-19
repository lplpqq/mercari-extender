# mercari-extender
<div style="text-align:center">

**Browser bookmarklet that allows to see detailed information about item on jp.mercari.com, which site itself does not display on page**
</div>


## Setup

### Minifying code

Install the uglifyjs module to minify code from index.js

```bash
$ npm install uglify-js
```

Minify code and save it in index.min.js file

```bash
$ uglifyjs index.js -o index.min.js; echo -e "javascript:$(cat index.min.js)" > index.min.js
```

Open the index.min.js file and copy content of it


### Google Chrome

- Navigate to `chrome://bookmarks/`
- Right-click on page and select `Add new bookmark`
- Create bookmarklet name (make it intuitive)
- For bookmarklet URL, put the minified code which you have obtained from previous step

## Usage

- Navigate to any item on `https://jp.mercari.com/`
- Click on the bookmarklet on the top of your page
- Wait a fraction of a second for the script to fetch information about the item
- Detailed info about item should have appeared on screen. Enjoy!
