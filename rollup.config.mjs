import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

const extensions = ['.js'];

const preventTreeShakingPlugin = () => {
  return {
    name: 'no-treeshaking',
    resolveId(id, importer) {
      if (!importer) {
        // no treeshaking entry points, as we're not exporting anything
        // in Apps Script files
        return { id, moduleSideEffects: 'no-treeshake' };
      }
      return null;
    },
  };
};

export default {
  input: './build/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    preventTreeShakingPlugin(),
    nodeResolve({ extensions }),
    cleanup({ comments: 'all' }),
  ],
  context: 'this',
};
