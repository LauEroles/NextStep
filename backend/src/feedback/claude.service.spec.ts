const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  }));
});

import { ClaudeService } from './claude.service';

describe('ClaudeService', () => {
  let service: ClaudeService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLAUDE_API_KEY = 'test-api-key';
    service = new ClaudeService();
  });

  it('generateFeedback devuelve el texto del bloque text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Feedback generado por IA' }],
    });

    const result = await service.generateFeedback('Generá feedback para el candidato');

    expect(result).toBe('Feedback generado por IA');
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: 'Generá feedback para el candidato' }],
    });
  });

  it('generateFeedback devuelve string vacío si no hay bloque text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'image', source: {} }],
    });

    const result = await service.generateFeedback('prompt');

    expect(result).toBe('');
  });

  it('generateFeedback devuelve string vacío si content está vacío', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [],
    });

    const result = await service.generateFeedback('prompt');

    expect(result).toBe('');
  });

  it('usa apiKey vacía si CLAUDE_API_KEY no está definida', () => {
    delete process.env.CLAUDE_API_KEY;

    expect(() => new ClaudeService()).not.toThrow();
  });
});