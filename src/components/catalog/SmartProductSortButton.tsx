import { SmartProductSort } from "@/components/catalog/SmartProductSort"

export function SmartProductSortButton({
  enabled,
  onToggle,
  productTags
}: {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  productTags?: string[]
}) {
  return (
    <div className="mb-6 flex items-center justify-end">
      <SmartProductSort enabled={enabled} onToggle={onToggle} productTags={productTags} />
    </div>
  )
}
