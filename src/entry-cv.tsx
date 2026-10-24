import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Cv from './pages/Cv'
import Seo from './components/Seo'
export { siteUrl } from './lib/seo'

export function render() {
  return { head: renderToStaticMarkup(<Seo page="cv" />), body: renderToString(<Cv />) }
}
