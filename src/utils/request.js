const request = (url) => {
  return window.fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export default url =>
  (typeof url === 'string'
    ? request(url).then(response => response.json())
    : Promise.resolve(url))
