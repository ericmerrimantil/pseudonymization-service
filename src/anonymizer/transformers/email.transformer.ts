import * as emailAddresses from 'email-addresses'
import { cacheFactory } from '../../cache'
import { hash } from '../helpers'

export interface AnonymizeEmailConfig {
  anonymizeInternalEmailUsername: boolean,
  anonymizeExternalEmailUsername: boolean,
  anonymizeInternalEmailDomain: boolean,
  anonymizeExternalEmailDomain: boolean,
  internalDomainList: string[],
  anonymizationSalt: string
}

const anonymizeAddress = (username: string, domain: string, params: AnonymizeEmailConfig): string => {
  const {
    anonymizeInternalEmailUsername,
    anonymizeExternalEmailUsername,
    anonymizeInternalEmailDomain,
    anonymizeExternalEmailDomain,
    internalDomainList,
    anonymizationSalt
  } = params

  const isInternal = internalDomainList.indexOf(domain) > -1

  const anonymizeInternalUsername = isInternal
  && anonymizeInternalEmailUsername
  const anonymizeExternalUsername = !isInternal
  && anonymizeExternalEmailUsername
  const anonymizeUsername = anonymizeInternalUsername || anonymizeExternalUsername

  const anonymizeInternalDomain = isInternal
  && anonymizeInternalEmailDomain
  const anonymizeExternalDomain = !isInternal
  && anonymizeExternalEmailDomain
  const anonymizeDomain = anonymizeInternalDomain || anonymizeExternalDomain

  const finalUsername = anonymizeUsername
    ? hash(username, anonymizationSalt)
    : username

  const finalDomain = anonymizeDomain
    ? `${hash(domain, anonymizationSalt)}.hash`
    : domain

  return `${finalUsername}@${finalDomain}`
}

const normalizeValue = (value = '') => {
  return value.trim().toLocaleLowerCase()
}

const cache = cacheFactory<string>()
export const email = (email: string, config: AnonymizeEmailConfig): string => {
  const normalizedEmail = normalizeValue(email)
  if (cache.has(normalizedEmail)) {
    return cache.get(normalizedEmail).v
  }

  const addressList: any[] = emailAddresses.parseAddressList(email) || []
  const anonymizedEmail = addressList
    .map(address => {
      const normalizedUsername = normalizeValue(address.local)
      const normalizedDomain = normalizeValue(address.domain)

      return anonymizeAddress(normalizedUsername, normalizedDomain, config)
    })
    .join(', ')

  cache.set(normalizedEmail, anonymizedEmail, 5 * 50) // keep in cache for 5 minutes

  return anonymizedEmail
}
