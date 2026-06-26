import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  FeedbackExistsHandler,
  FeedbackHasCommentHandler,
  FeedbackHasScorecardsHandler,
  buildFeedbackGenerationChain,
} from './feedback-generation.chain';
import { Feedback } from '../entities/feedback.entity';
import { Scorecard } from '../../scorecards/entities/scorecard.entity';
import { mock } from 'jest-mock-extended';

describe('FeedbackGenerationChain', () => {
  const feedbackMock = mock<Feedback>({
    comment: 'Muy buen desempeño',
  });

  const scorecardMock = mock<Scorecard>();

  describe('FeedbackExistsHandler', () => {
    it('debería lanzar NotFoundException si el feedback no existe', () => {
      const handler = new FeedbackExistsHandler();

      expect(() =>
        handler.handle({
          feedback: null,
          scorecards: [],
        }),
      ).toThrow(NotFoundException);
    });

    it('no debería lanzar excepción si el feedback existe', () => {
      const handler = new FeedbackExistsHandler();

      expect(() =>
        handler.handle({
          feedback: feedbackMock,
          scorecards: [],
        }),
      ).not.toThrow();
    });
  });

  describe('FeedbackHasCommentHandler', () => {
    it('debería lanzar NotFoundException si el comentario no existe', () => {
      const handler = new FeedbackHasCommentHandler();

      expect(() =>
        handler.handle({
          feedback: mock<Feedback>({ comment: '' }),
          scorecards: [],
        }),
      ).toThrow(NotFoundException);
    });

    it('no debería lanzar excepción si el comentario existe', () => {
      const handler = new FeedbackHasCommentHandler();

      expect(() =>
        handler.handle({
          feedback: feedbackMock,
          scorecards: [],
        }),
      ).not.toThrow();
    });
  });

  describe('FeedbackHasScorecardsHandler', () => {
    it('debería lanzar BadRequestException si no hay scorecards', () => {
      const handler = new FeedbackHasScorecardsHandler();

      expect(() =>
        handler.handle({
          feedback: feedbackMock,
          scorecards: [],
        }),
      ).toThrow(BadRequestException);
    });

    it('no debería lanzar excepción si existe al menos un scorecard', () => {
      const handler = new FeedbackHasScorecardsHandler();

      expect(() =>
        handler.handle({
          feedback: feedbackMock,
          scorecards: [scorecardMock],
        }),
      ).not.toThrow();
    });
  });

  describe('buildFeedbackGenerationChain', () => {
    it('debería ejecutar toda la cadena correctamente', () => {
      const chain = buildFeedbackGenerationChain();

      expect(() =>
        chain.handle({
          feedback: feedbackMock,
          scorecards: [scorecardMock],
        }),
      ).not.toThrow();
    });

    it('debería detenerse en el primer handler si el feedback no existe', () => {
      const chain = buildFeedbackGenerationChain();

      expect(() =>
        chain.handle({
          feedback: null,
          scorecards: [scorecardMock],
        }),
      ).toThrow(NotFoundException);
    });

    it('debería detenerse en el segundo handler si no hay comentario', () => {
      const chain = buildFeedbackGenerationChain();

      expect(() =>
        chain.handle({
          feedback: mock<Feedback>({ comment: '' }),
          scorecards: [scorecardMock],
        }),
      ).toThrow(NotFoundException);
    });

    it('debería detenerse en el tercer handler si no hay scorecards', () => {
      const chain = buildFeedbackGenerationChain();

      expect(() =>
        chain.handle({
          feedback: feedbackMock,
          scorecards: [],
        }),
      ).toThrow(BadRequestException);
    });
  });
});