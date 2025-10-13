import { DefaultHtmlTemplate } from './DefaultHtmlTemplate'
import SimpleProductTemplate from './SimpleProductTemplate'
import DarkHeroTemplate from './DarkHeroTemplate'
import SmellAddaCatalogTemplate from './FurnitureCatalogueTemplate'
// Local template types to avoid importing editor internals
type IframePage = {
  id: string
  name: string
  html: string
  css?: string
}

export type PrebuiltTemplate = {
  id: string
  name: string
  engine: 'mustache' | 'handlebars'
  pages: IframePage[]
  sharedCss?: string
}

export const HtmlTemplates: PrebuiltTemplate[] = [
  DefaultHtmlTemplate as unknown as PrebuiltTemplate,
  SimpleProductTemplate as unknown as PrebuiltTemplate,
  DarkHeroTemplate as unknown as PrebuiltTemplate,
  SmellAddaCatalogTemplate as unknown as PrebuiltTemplate,
].filter(Boolean)

export const getTemplateById = (id: string): PrebuiltTemplate | undefined => {
  return HtmlTemplates.find(t => t.id === id)
}

export default HtmlTemplates