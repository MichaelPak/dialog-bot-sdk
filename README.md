Dialog Node.js client
=====================

[Documentation](https://dialogs.github.io/dialog-node-client)

Installation
------------

```bash
npm install @dlghq/dialog-node-client
````

Usage
-----

```js
const path = require('path');
const { Bot } = require('@dlghq/dialog-node-client');

const bot = new Bot({
  endpoints: ['wss://ws1.dlg.im'],
  phone: '75555555555', 
  code: '5555'
});

bot.onMessage(async (peer, message) => {
  // get self uid
  const uid = await bot.getUid();
  
  if (message.content.type === 'text') {
    await bot.sendTextMessage(peer, message.content.text);
  }
});

// handle errors
bot.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
```
