# License Gate Wrapper

## Installation

To install CommandKit, simply run the following command:

For npm:


```bash

npm install licensegate

```

## Usage
```js
//index.js
const LicenseGate = require('licensegate').default;
const { ValidationType } = require('licensegate');

async function checkLicense() {
  const userId = 'a1cdb';
  const licenseKey = '045eada5-3bec-42c0-8203-2b8f9be3c166'; // Ersetzen Sie dies durch den zu überprüfenden Lizenzschlüssel

  const licenseGate = new LicenseGate(userId);

  const result = await licenseGate.verify(licenseKey);

  if (result === ValidationType.VALID) {
    console.log('Der Lizenzschlüssel ist gültig.');
  } else {
    console.log(`Der Lizenzschlüssel ist ungültig. Grund: ${result}`);
  }
}

checkLicense().catch(console.error);
```