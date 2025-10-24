interface Product {
  name: string
  tags?: string[]
  sortOrder?: number
  createdAt?: Date | string
}

export function smartSort(products: Product[]) {
  const priority: Record<string, number> = {
    bestseller: 1,
    trending: 2,
    seasonal: 3,
    new: 4,
    featured: 5,
  }

  return products.sort((a, b) => {
    // Get the highest priority tag for each product
    const tagsA = a.tags?.map(tag => tag.toLowerCase()) || []
    const tagsB = b.tags?.map(tag => tag.toLowerCase()) || []

    const highestPriorityA = Math.min(...tagsA.map(tag => priority[tag] || 999))
    const highestPriorityB = Math.min(...tagsB.map(tag => priority[tag] || 999))

    if (highestPriorityA !== highestPriorityB) {
      return highestPriorityA - highestPriorityB
    }

    // If same priority, use sortOrder
    if (
      a.sortOrder !== undefined &&
      b.sortOrder !== undefined &&
      a.sortOrder !== b.sortOrder
    ) {
      return a.sortOrder - b.sortOrder
    }

    // If same sortOrder or undefined, sort by newest first
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    // Finally, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
}
