import axios from 'axios';
import * as crypto from 'crypto';
import * as util from 'util';

export enum ValidationType {
  VALID = 'VALID',
  NOT_FOUND = 'NOT_FOUND',
  NOT_ACTIVE = 'NOT_ACTIVE',
  EXPIRED = 'EXPIRED',
  LICENSE_SCOPE_FAILED = 'LICENSE_SCOPE_FAILED',
  IP_LIMIT_EXCEEDED = 'IP_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FAILED_CHALLENGE = 'FAILED_CHALLENGE',
  SERVER_ERROR = 'SERVER_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR'
}

export class LicenseGate {
  private static readonly DEFAULT_SERVER = 'https://api.licensegate.io';

  private userId: string;
  private publicRsaKey?: string;
  private validationServer: string = LicenseGate.DEFAULT_SERVER;
  private useChallenge: boolean = false;
  private debugMode: boolean = false;

  constructor(userId: string, publicRsaKey?: string) {
    this.userId = userId;
    if (publicRsaKey) {
      this.publicRsaKey = publicRsaKey;
      this.useChallenge = true;
    }
  }

  setPublicRsaKey(publicRsaKey: string): LicenseGate {
    this.publicRsaKey = publicRsaKey;
    return this;
  }

  setValidationServer(validationServer: string): LicenseGate {
    this.validationServer = validationServer;
    return this;
  }

  useChallenges(): LicenseGate {
    this.useChallenge = true;
    return this;
  }

  debug(): LicenseGate {
    this.debugMode = true;
    return this;
  }

  async verify(licenseKey: string, scope?: string, metadata?: string): Promise<ValidationType> {
    try {
      const challenge = this.useChallenge ? String(Date.now()) : undefined;
      const response = await this.requestServer(this.buildUrl(licenseKey, scope, metadata, challenge));

      if (response.error || !response.result) {
        if (this.debugMode) console.log(`Error: ${response.error}`);
        return ValidationType.SERVER_ERROR;
      }

      if (response.valid !== undefined && !response.valid) {
        const result = ValidationType[response.result as keyof typeof ValidationType];
        if (result === ValidationType.VALID) {
          return ValidationType.SERVER_ERROR;
        } else {
          return result;
        }
      }

      if (this.useChallenge) {
        if (!response.signedChallenge) {
          if (this.debugMode) console.log('Error: No challenge result');
          return ValidationType.FAILED_CHALLENGE;
        }

        if (!this.verifyChallenge(challenge!, response.signedChallenge)) {
          if (this.debugMode) console.log('Error: Challenge verification failed');
          return ValidationType.FAILED_CHALLENGE;
        }
      }

      return ValidationType[response.result as keyof typeof ValidationType];
    } catch (e) {
      if (this.debugMode) console.error(e);
      return ValidationType.CONNECTION_ERROR;
    }
  }

  async verifySimple(licenseKey: string, scope?: string, metadata?: string): Promise<boolean> {
    return (await this.verify(licenseKey, scope, metadata)) === ValidationType.VALID;
  }

  private buildUrl(licenseKey: string, scope?: string, metadata?: string, challenge?: string): string {
    let queryString = '';

    if (metadata) {
      queryString += `?metadata=${encodeURIComponent(metadata)}`;
    }

    if (scope) {
      queryString += `${queryString ? '&' : '?'}scope=${encodeURIComponent(scope)}`;
    }

    if (this.useChallenge && challenge) {
      queryString += `${queryString ? '&' : '?'}challenge=${encodeURIComponent(challenge)}`;
    }

    return `${this.validationServer}/license/${this.userId}/${licenseKey}/verify${queryString}`;
  }

  private async requestServer(url: string): Promise<any> {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (this.debugMode) {
      console.log(`\nSending request to URL : ${url}`);
      console.log(`Response Code : ${response.status}`);
      console.log(`Response: ${response.data}`);
    }
    return response.data;
  }

  private verifyChallenge(challenge: string, signedChallengeBase64: string): boolean {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(challenge);
      verify.end();
      const publicKey = this.publicRsaKey!.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, '');
      return verify.verify(publicKey, signedChallengeBase64, 'base64');
    } catch (e) {
      if (this.debugMode) console.error(e);
      return false;
    }
  }
}