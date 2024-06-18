# License Gate Wrapper

## Installation

To install LicenseGate Wrapper, simply run the following command:

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
  const userId = 'Your UserID';
  const licenseKey = 'Your LicenseKey';

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

### With Custom Server URL
```js
//index.js
const LicenseGate = require('licensegate').default;
const { ValidationType } = require('licensegate');

async function checkLicense() {
  const userId = 'Your UserID';
  const licenseKey = 'Your LicenseKey';
  const serverUrl = 'https://mybackendserver.com';

  const licenseGate = new LicenseGate(userId).setValidationServer(serverUrl);

  const result = await licenseGate.verify(licenseKey);

  if (result === ValidationType.VALID) {
    console.log('Der Lizenzschlüssel ist gültig.');
  } else {
    console.log(`Der Lizenzschlüssel ist ungültig. Grund: ${result}`);
  }
}

checkLicense().catch(console.error);
```

### With Public Rsa Key
```js
//index.js
const LicenseGate = require('licensegate').default;
const { ValidationType } = require('licensegate');

async function checkLicense() {
  const userId = 'Your UserID';
  const licenseKey = 'Your LicenseKey';
  const publicRSAKey = 'Your RSA Key'

  const licenseGate = new LicenseGate(userId).setPublicRsaKey(publicRSAKey);

  const result = await licenseGate.verify(licenseKey);

  if (result === ValidationType.VALID) {
    console.log('Der Lizenzschlüssel ist gültig.');
  } else {
    console.log(`Der Lizenzschlüssel ist ungültig. Grund: ${result}`);
  }
}

checkLicense().catch(console.error);
```