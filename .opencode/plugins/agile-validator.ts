import type { Plugin } from '@opencode-ai/plugin';
import { readFile, access, readdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MAX_ATTEMPTS = 5;

interface ValidationStep {
  name: string;
  passed: boolean;
  output: string;
}

interface ValidationResult {
  nonce: string;
  timestamp: string;
  passed: boolean;
  steps: ValidationStep[];
}

export const AgileValidator: Plugin = async ({ client, worktree }) => {
  const nonces = new Map<string, string>();
  const retryCounts = new Map<string, number>();

  const findValidationProjectRoot = async (
    root: string,
    depth = 4,
  ): Promise<string | null> => {
    try {
      await access(join(root, 'scripts', 'agile-validate.sh'));
      return root;
    } catch {
      if (depth === 0) return null;
    }

    let entries;
    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch {
      return null;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const match = await findValidationProjectRoot(join(root, entry.name), depth - 1);
      if (match) return match;
    }

    return null;
  };

  const projectRoot = (await findValidationProjectRoot(worktree)) ?? worktree;

  const toast = (message: string, variant: 'info' | 'success' | 'error') =>
    client.tui.showToast({ body: { message, variant } });

  const chatLog = (sessionID: string, message: string) =>
    client.session.prompt({
      path: { id: sessionID },
      body: {
        agent: 'agile',
        noReply: true,
        parts: [{ type: 'text', text: `[AgileValidator] ${message}` }],
      },
    });

  const injectNonce = async (sessionID: string): Promise<string> => {
    const nonce = randomUUID();
    nonces.set(sessionID, nonce);
    await client.session.prompt({
      path: { id: sessionID },
      body: {
        agent: 'agile',
        noReply: true,
        parts: [
          {
            type: 'text',
            text: `[AgileValidator] Your validation nonce is: ${nonce}`,
          },
        ],
      },
    });
    return nonce;
  };

  const readResultFile = async (): Promise<ValidationResult | null> => {
    try {
      const filePath = join(projectRoot, 'agile-val-results.json');
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as ValidationResult;
    } catch {
      return null;
    }
  };

  // Startup check: verify agile-validate.sh exists in the project
  const scriptPath = join(projectRoot, 'scripts', 'agile-validate.sh');
  let scriptMissing = false;
  try {
    await access(scriptPath);
  } catch {
    scriptMissing = true;
  }
  const warnedSessions = new Set<string>();

  return {
    event: async ({ event }) => {
      // Reset retry counter when the user sends a new message
      // Inject nonce on first user message for agile agent sessions
      if (event.type === 'message.updated') {
        const msg = event.properties.info;
        if (msg.role === 'user') {
          retryCounts.set(msg.sessionID, 0);
          if (
            'agent' in msg &&
            msg.agent === 'agile' &&
            !nonces.has(msg.sessionID)
          ) {
            await injectNonce(msg.sessionID);
            if (scriptMissing && !warnedSessions.has(msg.sessionID)) {
              warnedSessions.add(msg.sessionID);
              await chatLog(
                msg.sessionID,
                `Warning: \`scripts/agile-validate.sh\` was not found in the project root. The agile agent will not be able to self-validate. Please create this script before starting a feature cycle.`,
              );
            }
          }
        }
        return;
      }

      if (event.type !== 'session.idle') return;

      const sessionID = event.properties.sessionID;

      // Check if the most recent agent used was agile
      const { data: messages } = await client.session.messages({
        path: { id: sessionID },
      });
      if (!messages?.length) return;

      const lastUserMsg = [...messages]
        .reverse()
        .find((m) => m.info.role === 'user');
      if (!lastUserMsg || !('agent' in lastUserMsg.info)) return;
      if (lastUserMsg.info.agent !== 'agile') return;

      // Find the last assistant message and extract its final text
      const lastAssistantMsg = [...messages]
        .reverse()
        .find((m) => m.info.role === 'assistant');
      if (!lastAssistantMsg) return;

      // Skip if the response was interrupted, errored, or didn't complete
      const assistantInfo = lastAssistantMsg.info;
      if (assistantInfo.role !== 'assistant') return;
      if (assistantInfo.error) return;
      if (!assistantInfo.finish) return;

      const textParts = lastAssistantMsg.parts.filter(
        (p) => p.type === 'text',
      );
      const lastTextPart = textParts[textParts.length - 1];
      if (!lastTextPart || lastTextPart.type !== 'text') return;

      const responseText = lastTextPart.text.trimEnd();

      // Check for response tags
      if (responseText.endsWith('<CONTINUE>')) return;

      if (!responseText.endsWith('<FEATURE_DONE>')) {
        await toast('Missing response tag — prompting agent', 'info');
        await client.session.prompt({
          path: { id: sessionID },
          body: {
            agent: 'agile',
            parts: [
              {
                type: 'text',
                text: 'Your response must end with either <FEATURE_DONE> or <CONTINUE> as the very last token. Please resend your last response with the appropriate tag.',
              },
            ],
          },
        });
        return;
      }

      // <FEATURE_DONE> detected — check attempt limit
      const attempts = (retryCounts.get(sessionID) ?? 0) + 1;
      retryCounts.set(sessionID, attempts);

      if (attempts > MAX_ATTEMPTS) {
        await toast(
          `Validation failed after ${MAX_ATTEMPTS} attempts — stopping`,
          'error',
        );
        await chatLog(
          sessionID,
          `Validation failed after ${MAX_ATTEMPTS} attempts. Stopping automatic retries — please review the failures manually.`,
        );
        return;
      }

      // Ensure we have a nonce for this session
      let expectedNonce = nonces.get(sessionID);
      if (!expectedNonce) {
        expectedNonce = await injectNonce(sessionID);
        await client.session.prompt({
          path: { id: sessionID },
          body: {
            agent: 'agile',
            parts: [
              {
                type: 'text',
                text: `No validation nonce was set. Your nonce is: ${expectedNonce}. Run \`bash scripts/agile-validate.sh ${expectedNonce}\` and return \`<FEATURE_DONE>\`.`,
              },
            ],
          },
        });
        return;
      }

      // Read and verify the validation result file
      await toast('Checking validation results...', 'info');
      const result = await readResultFile();

      if (!result) {
        await toast('Validation result file not found', 'error');
        await client.session.prompt({
          path: { id: sessionID },
          body: {
            agent: 'agile',
            parts: [
              {
                type: 'text',
                text: `Validation result file not found. You must run \`bash scripts/agile-validate.sh ${expectedNonce}\` before returning \`<FEATURE_DONE>\`.`,
              },
            ],
          },
        });
        return;
      }

      if (result.nonce !== expectedNonce) {
        await toast('Validation nonce mismatch — stale result', 'error');
        await client.session.prompt({
          path: { id: sessionID },
          body: {
            agent: 'agile',
            parts: [
              {
                type: 'text',
                text: `Validation nonce mismatch (expected: ${expectedNonce}, got: ${result.nonce}). Run \`bash scripts/agile-validate.sh ${expectedNonce}\` and return \`<FEATURE_DONE>\`.`,
              },
            ],
          },
        });
        return;
      }

      // Nonce matches — check results
      if (result.passed) {
        retryCounts.set(sessionID, 0);
        await toast('All checks passed', 'success');
        await chatLog(sessionID, 'All checks passed (lint + E2E tests).');
        // Recycle the nonce for the next feature cycle
        await injectNonce(sessionID);
        return;
      }

      // Validation failed — report failures
      const failedSteps = result.steps.filter((s) => !s.passed);
      const failureDetails = failedSteps
        .map((s) => `## ${s.name} (FAILED)\n\`\`\`\n${s.output}\n\`\`\``)
        .join('\n\n');

      await toast(
        `Validation failed (attempt ${attempts}/${MAX_ATTEMPTS}) — sending errors to agent`,
        'error',
      );
      await client.session.prompt({
        path: { id: sessionID },
        body: {
          agent: 'agile',
          parts: [
            {
              type: 'text',
              text: [
                `Validation failed (attempt ${attempts}/${MAX_ATTEMPTS}). Fix the following issues, then run \`bash scripts/agile-validate.sh ${expectedNonce}\` again and return \`<FEATURE_DONE>\`:`,
                '',
                failureDetails,
              ].join('\n'),
            },
          ],
        },
      });
    },
  };
};
