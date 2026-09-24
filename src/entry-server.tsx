import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import Seo from './components/Seo'
export { siteUrl } from './lib/seo'
export function render() {
  return { head: renderToStaticMarkup(<Seo />), body: renderToString(<App staticRender />) }
}
