import {mkdirp} from 'mkdirp'
import fsExtra from 'fs-extra'

await mkdirp('public')
await mkdirp('public/examples')

fsExtra.copy('static', 'public')
fsExtra.copy('examples', 'public/examples')

