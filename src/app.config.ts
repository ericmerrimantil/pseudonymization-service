import { configFactory, toArray, toBoolean, toNumber, toPem, toString, TransformMap } from './config'

const appConfig = {
  apiToken: toString(),
  baseUrl: toString(),
  internalDomainList: toArray(),
  anonymizeExternalEmailDomain: toBoolean(true),
  anonymizeExternalEmailUsername: toBoolean(true),
  anonymizeInternalEmailDomain: toBoolean(false),
  anonymizeInternalEmailUsername: toBoolean(true),
  anonymizationSalt: toString(),
  rsaPrivateKey: toPem(),
  rsaPublicKey: toPem(),
  sslKey: toPem(),
  sslCert: toPem(),
  httpPort: toNumber(),
  httpsPort: toNumber()
}

const config = configFactory(appConfig, [
  'apiToken',
  'anonymizationSalt',
  'rsaPrivateKey',
  'rsaPublicKey',
  'sslKey',
  'sslCert'
])

export default config