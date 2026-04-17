import type { Plugin } from '@opencode-ai/plugin';

export const EnvProtection: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'read' && /\.env($|\.)/.test(output.args.filePath)) {
        throw new Error(
          'Reading .env files is not allowed. Use .env.example for reference.',
        );
      }
    },
  };
};
