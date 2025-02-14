import {createLinkMatcherWithRegExp} from '@lexical/react/LexicalAutoLinkPlugin'

const SUPPORTED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'sms:', 'tel:'])

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank'
    }
  } catch {
    return url
  }
  return url
}

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
)
export function validateUrl(url: string): boolean {
  return url === 'https://' || urlRegExp.test(url)
}

const EmailRegExp = new RegExp(
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/,
)

export const MATCHERS = [
  createLinkMatcherWithRegExp(urlRegExp, text => {
    return text
  }),
  createLinkMatcherWithRegExp(EmailRegExp, text => {
    return `mailto:${text}`
  }),
]
