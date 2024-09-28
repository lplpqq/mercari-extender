function loadScript(scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);

    return new Promise((res, rej) => {
        script.onload = function() {
            res();
        }
        script.onerror = function () {
            rej();
        }
    });
}


async function generateDpop(url, method, key, extraPayload = {}) {
    const payload = {
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
        htu: url,
        htm: method,
        ...extraPayload,
    };

    const { publicKey, privateKey } = await window.jose.generateKeyPair('ES256');
    const jwk = await window.jose.exportJWK(publicKey);

    const headers = {
        typ: 'dpop+jwt',
        alg: 'ES256',
        jwk: {
            crv: jwk.crv,
            kty: jwk.kty,
            x: jwk.x,
            y: jwk.y,
        },
    };

    return await new window.jose.SignJWT(payload)
        .setProtectedHeader(headers)
        .sign(privateKey);
}


function zeroPad(number) {
    return ('0' + number).slice(-2)
}


function formatDate (date) {
    return `${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}:${zeroPad(date.getSeconds())}` +
        ` ${zeroPad(date.getDate())}/${zeroPad(date.getMonth() + 1)}/${date.getFullYear()}`
}


(async () => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jose/5.6.3/index.umd.min.js').then(async () => {
        const currentUrl = location.href

        const supportedLocales = ["en", "ko", "zh-TW"];
        const itemRegex = new RegExp(
            `https:\/\/jp\.mercari\.com\/(${supportedLocales.join("|")}/)?item\/`,
            // Url locale is optional.
            // No locale in between jp.mercari.com and /item part means that default (japanese) locale will be applied
            'g'
        );

        if (!currentUrl.startsWith("https://jp.mercari.com")) {
            alert("This bookmarklet is designed to be used with jp.mercari.com");
            return
        } else if (!itemRegex.test(currentUrl)) {
            alert("Please proceed to the page with the item you would like to receive information about");
            return
        }

        const itemId = currentUrl.split('/').at(-1)
        const url = `https://api.mercari.jp/items/get?id=${itemId}`;
        const method = 'GET';

        const key = await window.jose.generateKeyPair('ES256');
        const dpop = await generateDpop(url, method, key.privateKey);

        const response = await fetch(url, {
            headers: {
                'dpop': dpop,
                'X-Platform': 'web',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0'
            }
        });
        const itemData = (await response.json())['data']

        let text = `Seller: https://jp.mercari.com/user/profile/${itemData['seller']['id']}\\n`;
        if ('buyer' in itemData) {
            text += `Buyer: https://jp.mercari.com/user/profile/${itemData['buyer']['id']}\\n`
        }
        text += `Status: ${itemData["status"].replaceAll('_', ' ')}\\n`
        if ('transaction_evidence' in itemData) {
            text += `Transaction status: ${itemData['transaction_evidence']['status'].replaceAll('_', ' ')}\\n`
        }

        const updated = new Date(itemData['updated'] * 1000)
        text += `Last update at: ${formatDate(updated)}\\n`

        const created = new Date(itemData['created'] * 1000)
        text += `Created at: ${formatDate(created)}\\n`

        alert(text)
    }).catch(() => {
        alert('Failed to load script')
    });
})();
