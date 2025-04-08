const { src, dest } = require('gulp');
const path = require('node:path');

/**
 * Copies the icon files from the source directories to the build directory.
 * Preserves the correct structure for n8n nodes.
 */
function buildIcons() {
  return src(path.join('src', 'nodes', '**', '*.svg'), { base: 'src' })
    .pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;
