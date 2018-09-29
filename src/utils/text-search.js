export const textSearch = (input = []) => (query = '') => {
  const queryExpr = new RegExp(query, 'ig')

  return input.reduce((results, item, index) => {
    const searchHits = item.match(queryExpr) || []

    // add n times the chunk index, for each hit one
    searchHits.forEach(() => {
      results.push(index)
    })

    return results
  }, [])
}
