// ES Module SRPC Client
// https://github.com/yzITI/srpc

// Usage:
// import useSRPC from './useSRPC'
// const srpc = useSRPC()
export default function useSRPC() {
  const SRPC = () => {
    let url = '/'
    const getFunction = N => ((...A) => fetch(url, {
      method: 'POST', mode: 'cors', cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ N, A })
    }).then(async r => {
      if (r.status === 200) return (await r.json()).R
      else throw (await r.text())
    }))
    const proxyGet = (target, key) => {
      const N = target.N || [], newN = [...N, key], f = getFunction(newN)
      f.N = newN
      return new Proxy(f, { get: proxyGet })
    }
    return new Proxy((endpoint = '/') => url = endpoint, { get: proxyGet })
  }
  const srpc = SRPC()
  return srpc
}