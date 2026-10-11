import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Dashboard from './pages/Dashboard'
import Seo from './components/Seo'
export { siteUrl } from './lib/seo'

export function render() {
  return { head: renderToStaticMarkup(<Seo page="dashboard" />), body: renderToString(<Dashboard />) }
}
