
import SmellAddaCatalogTemplate from './FurnitureCatalogueTemplate'
import FashionCatalogueTemplate from './FashionCatalogueTemplate'
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

  SmellAddaCatalogTemplate as unknown as PrebuiltTemplate,
  FashionCatalogueTemplate as unknown as PrebuiltTemplate,
].filter(Boolean)

export const getTemplateById = (id: string): PrebuiltTemplate | undefined => {
  return HtmlTemplates.find(t => t.id === id)
}

export default HtmlTemplates