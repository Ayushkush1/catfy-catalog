import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SmartProductSortProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  productTags?: string[]
}

export function SmartProductSort({ enabled, onToggle, productTags = [] }: SmartProductSortProps) {
  // Get unique tags from all products
  const uniqueTags = Array.from(new Set(productTags)).sort()

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Smart Product Sorting</Label>
          <p className="text-sm text-gray-600">Automatically sort products based on tags</p>
        </div>
        <Switch 
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      
      {enabled && uniqueTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Active Tags</Label>
          <div className="flex flex-wrap gap-2">
            {uniqueTags.map((tag) => (
              <Badge 
                key={tag}
                variant="secondary" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Priority order: bestseller → trending → seasonal → new
          </p>
        </div>
      )}
    </div>
  )
}
