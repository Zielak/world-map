import { parse } from 'fast-xml-parser'

export const parseOSMXml = (xml: string) => {
  return parse(xml)
}
