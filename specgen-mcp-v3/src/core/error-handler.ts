import { CallToolResult, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export interface StructuredError {
  error: string;
  code: string;
  context?: Record<string, any>;
  suggestions?: string[];
  recovery?: string;
}

export class StructuredErrorHandler {
  static createError(
    message: string,
    code: string,
    context?: Record<string, any>,
    suggestions?: string[],
    recovery?: string
  ): StructuredError {
    return {
      error: message,
      code,
      context,
      suggestions,
      recovery
    };
  }

  static formatAsCallToolResult(structuredError: StructuredError): CallToolResult {
    const errorText = `❌ Error: ${structuredError.error}

🔍 Error Details:
• Code: ${structuredError.code}
${structuredError.context ? `• Context: ${JSON.stringify(structuredError.context, null, 2)}` : ''}

${structuredError.suggestions ? `💡 Suggestions:
${structuredError.suggestions.map(s => `• ${s}`).join('\n')}` : ''}

${structuredError.recovery ? `🔄 Recovery:
${structuredError.recovery}` : ''}`;

    return {
      content: [{
        type: "text",
        text: errorText
      }],
      isError: true
    };
  }

  static wrapToolExecution<T extends any[], R>(
    toolName: string,
    fn: (...args: T) => Promise<R>
  ) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`Tool ${toolName} failed:`, error);

        if (error instanceof Error) {
          const structuredError = this.createError(
            error.message,
            `${toolName}_error`,
            { originalError: error.name },
            [
              'Check the input parameters',
              'Verify file paths exist',
              'Ensure proper permissions'
            ],
            'Review the error details and try again with corrected parameters'
          );

          throw new McpError(
            ErrorCode.InternalError,
            JSON.stringify(structuredError)
          );
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool ${toolName} failed: ${String(error)}`
        );
      }
    };
  }

  static handleAsyncOperation<T>(
    operation: Promise<T>,
    operationName: string,
    timeout: number = 30000
  ): Promise<T> {
    return Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(this.createError(
            `Operation timed out after ${timeout}ms`,
            'timeout_error',
            { operation: operationName, timeout },
            [
              'Try increasing the timeout',
              'Check if the operation is stuck',
              'Reduce the scope of the operation'
            ],
            'Retry with a smaller scope or longer timeout'
          ));
        }, timeout);
      })
    ]);
  }

  // Backward compatibility method
  handleError(toolName: string, error: any, context?: any): { content: [{ type: string; text: string }] } {
    const structuredError = StructuredErrorHandler.createError(
      error.message || String(error),
      `${toolName}_error`,
      context,
      context?.suggestions || [
        'Check the input parameters',
        'Verify file paths exist',
        'Ensure proper permissions'
      ],
      context?.recovery || 'Review the error details and try again with corrected parameters'
    );

    const result = StructuredErrorHandler.formatAsCallToolResult(structuredError);
    return {
      content: [{
        type: 'text',
        text: (result.content[0] as any)?.text || 'Unknown error occurred'
      }]
    };
  }
}