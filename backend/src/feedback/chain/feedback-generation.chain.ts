import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Feedback } from '../entities/feedback.entity';
import { Scorecard } from '../../scorecards/entities/scorecard.entity';

export interface FeedbackGenerationContext {
  feedback: Feedback | null;
  scorecards: Scorecard[];
}

export abstract class FeedbackGenerationHandler {
  private nextHandler?: FeedbackGenerationHandler;

  setNext(handler: FeedbackGenerationHandler): FeedbackGenerationHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(context: FeedbackGenerationContext): void {
    this.check(context);
    if (this.nextHandler) {
      this.nextHandler.handle(context);
    }
  }

  protected abstract check(context: FeedbackGenerationContext): void;
}

// 1. ¿Existe el feedback?
export class FeedbackExistsHandler extends FeedbackGenerationHandler {
  protected check({ feedback }: FeedbackGenerationContext): void {
    if (!feedback) {
      throw new NotFoundException('No se encontró el feedback.');
    }
  }
}

// 2. ¿Tiene comentario cargado?
export class FeedbackHasCommentHandler extends FeedbackGenerationHandler {
  protected check({ feedback }: FeedbackGenerationContext): void {
    if (!feedback?.comment) {
      throw new NotFoundException(
        'Este feedback no tiene comentarios cargados todavía.',
      );
    }
  }
}

// 3. ¿Tiene al menos un scorecard? (regla nueva, fácil de agregar gracias a la cadena)
export class FeedbackHasScorecardsHandler extends FeedbackGenerationHandler {
  protected check({ scorecards }: FeedbackGenerationContext): void {
    if (!scorecards || scorecards.length === 0) {
      throw new BadRequestException(
        'No se puede generar el feedback público sin al menos un scorecard cargado.',
      );
    }
  }
}

// Helper para armar la cadena ya conectada
export function buildFeedbackGenerationChain(): FeedbackGenerationHandler {
  const existsHandler = new FeedbackExistsHandler();
  const hasCommentHandler = new FeedbackHasCommentHandler();
  const hasScorecardsHandler = new FeedbackHasScorecardsHandler();

  existsHandler.setNext(hasCommentHandler).setNext(hasScorecardsHandler);

  return existsHandler;
}