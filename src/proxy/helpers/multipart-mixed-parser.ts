/*
  Example request

  --===============111111111111111==
  Content-Type: application/http
  MIME-Version: 1.0
  Content-Transfer-Encoding: binary
  Content-ID: <fde099ea-e992-42a9-8cc9-ddea517ebd0f + 1>

  GET /www.googleapis.com/gmail/v1/users/me/messages?maxResults=2&alt=json HTTP/1.1
  Content-Type: application/json
  MIME-Version: 1.0
  accept: application/json
  accept-encoding: gzip, deflate
  user-agent: google-api-python-client/1.7.9 (gzip)
  authorization: Bearer token
  Host: localhost:8443


  --===============111111111111111==--
*/
/*
  Example response

  --batch_randomString
  Content-Type: application/http
  Content-ID: <response-fde099ea-e992-42a9-8cc9-ddea517ebd0f + 1>

  HTTP/1.1 200 OK
  ETag: "string"
  Content-Type: application/json; charset=UTF-8
  Date: Wed, 30 Oct 2019 08:55:45 GMT
  Expires: Wed, 30 Oct 2019 08:55:45 GMT
  Cache-Control: private, max-age=0
  Content-Length: 233

  {}

  --batch_randomString--
*/

import { IncomingHttpHeaders } from "http"

export type MultipartMixedPart = {
  headers: IncomingHttpHeaders
  body?: string
}

export type MultipartMixedPartList = {
  separator: string,
  parts: MultipartMixedPart[]
}

const newLine = '\r\n'

const stringifyHeaders = (headers: IncomingHttpHeaders): string => {
  return Object.keys(headers)
    .map(key => {
      const value = headers[key]
      return `${key}: ${value}`
    })
    .join(newLine)
}

export const parseHeaders = (rawHeaders = ''): IncomingHttpHeaders => rawHeaders
  .split(/(\n|\r\n)/)
  .reduce((obj, str) => {
    const headerParts = str.match((/([^:]*):(.*)/))
    if (headerParts?.length >= 2) {
      const name = headerParts[1].toLowerCase()
      const value = headerParts[2].trim()
      obj[name] = value
    }
    return obj
  }, {})

export const parsePart = (part: string): MultipartMixedPart => {
  // Split content by 2 new lines (\r\n\r\n)
  const contentParts = part
    .split(/(\n\n|\r\n\r\n)/)
    .filter(v => v && v.trim())

  // Join headers
  const headers = parseHeaders(contentParts[0])

  const body = Object.keys(headers).length === 0
    ? contentParts.join(newLine.repeat(2))
    : contentParts.splice(1).join(newLine.repeat(2))

  return {
    headers,
    body
  }
}

// Multipart/mixed parser
const parse = (data: string): MultipartMixedPartList => {
  // Force \r\n for new lines
  const normalizedData = data
    .replace(/\r\n/, '\n')
    .replace(/\n/, '\r\n')
    .replace(/^(\r\n)+/, '')

  // First line is the separator
  const separator = normalizedData
    .split(newLine)[0]
    .trim()

  // Split data by separator
  const parts = normalizedData
    .split(separator)
    .map(part => part.trim())
    .filter((
      part => part !== '' && // Remove empty spaces
      part !== '--' // Remove -- from the end of the request (the end of the request is in `${separator}--` format)
    ))

  return {
    separator,
    parts: parts.map(parsePart)
  }
}

const stringify = (partList: MultipartMixedPartList): string => {
  const { parts, separator } = partList

  // Build multipart/mixed response
  const mappedStr = parts.map((part) => {
    const {
      headers,
      body
    } = part
    let output = (
      separator + newLine
    )
    if (Object.keys(headers).length > 0) {
      output += stringifyHeaders(headers)
      // Add body divider
      if (body) {
        output += newLine.repeat(2)
      }
    }
    if (body) {
      output += body + newLine
    }

    return output
  }).join(newLine)

  // Add separator with -- the end of the response
  return mappedStr + '\r\n' + separator + '--'
}

export default {
  parse,
  parsePart,
  parseHeaders,
  stringify
}
