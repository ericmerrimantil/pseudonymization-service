import {
  jsonMapper,
  TYPES,
  Schema
} from '../../../mapper'
import { Event } from '../common/interfaces'
import { event } from '../common/schema'

export interface UserEvents {
  '@odata.context': string
  '@odata.nextLink': string
  value: Event[]
}

export const schema: Schema<UserEvents> = {
  '@odata.context': [
    TYPES.Private,
    TYPES.String
  ],
  '@odata.nextLink': [
    TYPES.Url,
    TYPES.Proxify
  ],
  value: [
    event
  ]
}

export const listUserEventsMapper = jsonMapper<typeof schema, UserEvents>(schema)
