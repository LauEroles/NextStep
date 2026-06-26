import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { Scorecard } from '../scorecards/entities/scorecard.entity';
import { JobApplication } from '../job-applications/entities/job-application.entity';
import { ClaudeService } from './claude.service';
import { CvService } from '../cv/cv.service';
import { buildFeedbackGenerationChain } from './chain/feedback-generation.chain';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Scorecard)
    private readonly scorecardRepository: Repository<Scorecard>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    private readonly claudeService: ClaudeService,
    private readonly cvService: CvService,
  ) { }

  async create(createFeedbackDto: CreateFeedbackDto, recruiterId: number) {
    const existing = await this.feedbackRepository.findOne({
      where: {
        application: { id: createFeedbackDto.application_id },
        stage: { id: createFeedbackDto.stage_id },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe un feedback para esta etapa. Editá el feedback existente en lugar de crear uno nuevo.',
      );
    }

    const feedback = this.feedbackRepository.create({
      comment: createFeedbackDto.comment,
      technicalScore: createFeedbackDto.technicalScore,
      softSkillsScore: createFeedbackDto.softSkillsScore,
      internalNotes: createFeedbackDto.internalNotes,
      publicFeedback: createFeedbackDto.publicFeedback,
      application: { id: createFeedbackDto.application_id },
      stage: { id: createFeedbackDto.stage_id },
      recruiter: { id: recruiterId },
    });
    return await this.feedbackRepository.save(feedback);
  }

  async findByApplication(applicationId: number) {
    return await this.feedbackRepository.find({
      where: { application: { id: applicationId } },
      relations: ['application', 'stage', 'recruiter'],
      order: { stage: { sequenceOrder: 'ASC' } },
    });
  }

  async findByApplicationForApplicant(applicationId: number, userId: number) {
    return await this.feedbackRepository.find({
      where: {
        application: { id: applicationId, applicant: { id: userId } },
      },
      relations: ['application', 'stage', 'recruiter'],
      order: { stage: { sequenceOrder: 'ASC' } },
    });
  }

  async findAllForApplicant(userId: number) {
    return await this.feedbackRepository.find({
      where: {
        application: {
          applicant: { id: userId },
        },
        publicFeedback: Not(IsNull()) && Not(''),
      },
      relations: ['application', 'stage', 'recruiter'],
    });
  }

  async findAll() {
    return await this.feedbackRepository.find({
      relations: ['application', 'stage', 'recruiter'],
    });
  }

  async findOne(id: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['application', 'stage', 'recruiter'],
    });
    if (!feedback) {
      throw new NotFoundException(`El feedback con id #${id} no existe`);
    }
    return feedback;
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.findOne(id);
    const updated = Object.assign(feedback, updateFeedbackDto);
    return await this.feedbackRepository.save(updated);
  }

  async remove(id: number) {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
    return { message: `Feedback #${id} eliminado correctamente` };
  }

  async generateFeedbackForOne(feedbackId: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: [
        'stage',
        'application',
        'application.jobOffer',
        'application.jobOffer.seniority',
        'application.applicant',
      ],
    });

    const scorecards = feedback
      ? await this.scorecardRepository.find({
        where: { feedback: { id: feedbackId } },
      })
      : [];

    // 🔗 Chain of Responsibility: corre las validaciones en secuencia
    const chain = buildFeedbackGenerationChain();
    chain.handle({ feedback, scorecards });

    // Si llegamos acá, la cadena ya garantizó que feedback no es null
    const cv = await this.cvService.getLatestCvByUser(
      feedback!.application.applicant.id,
    );

    const prompt = this.buildSingleStagePrompt(feedback!, scorecards, cv);
    const generatedText = await this.claudeService.generateFeedback(prompt);

    feedback!.publicFeedback = generatedText;
    await this.feedbackRepository.save(feedback!);

    return feedback;
  }

  async findByRecruiter(recruiterId: number) {
    return await this.feedbackRepository.find({
      where: { recruiter: { id: recruiterId } },
      relations: ['application', 'stage', 'recruiter'],
    });
  }

  private buildSingleStagePrompt(
    feedback: Feedback,
    scorecards: Scorecard[],
    cv: { originalName: string } | null,
  ): string {
    const application = feedback.application;
    const isRejectionStage = feedback.stage?.name === 'No avanza';

    const jobInfo = `Vacante: ${application.jobOffer.title}
Descripción: ${application.jobOffer.description}
Seniority requerido: ${application.jobOffer.seniority?.name ?? 'No especificado'}`;

    const scorecardTexts = scorecards
      .map((sc) => `${sc.skillName} (${sc.type}): ${sc.score}/10`)
      .join('\n');

    const cvInfo = cv
      ? 'El candidato adjuntó un CV.'
      : 'El candidato no adjuntó CV.';

    const closingInstruction = isRejectionStage
      ? `Esta es la etapa final del proceso y el candidato NO continúa. Comunicá esto de forma respetuosa y constructiva, sin culpar al candidato, agradeciendo su participación. No uses la palabra "rechazado" ni listes razones que suenen a juicio personal.`
      : `IMPORTANTE: NO mencionar si el candidato fue contratado, descartado, o si avanza o no en el proceso. Esa decisión es exclusiva del equipo de reclutamiento y no debe insinuarse en este texto. Este feedback es solo sobre el desempeño en ESTA etapa puntual.`;

    return `Actuá como un especialista en RRHH redactando feedback constructivo para un candidato, sobre su desempeño específico en una etapa de un proceso de selección.

DATOS DE LA VACANTE:
${jobInfo}

ETAPA EVALUADA: ${feedback.stage?.name}

NOTAS DEL ENTREVISTADOR EN ESTA ETAPA:
${feedback.comment}

EVALUACIONES (SCORECARDS) DE ESTA ETAPA:
${scorecardTexts || 'No se registraron scorecards para esta etapa.'}

${cvInfo}

${closingInstruction}

Generá un feedback profesional, empático y constructivo en español, específico sobre esta etapa, que incluya:
1. Un comentario sobre su desempeño en esta etapa puntual
2. Puntos fuertes identificados
3. Áreas de mejora con recomendaciones concretas de como reforzarlas
4.Tener en cuenta que nuestro puntaje de scorecards va del 1 al 5, el feedback que le des al candidato debe ser coherente con esos puntajes. Por ejemplo, si tiene un puntaje bajo en "comunicación", el feedback debería mencionar que se identificó esa área de mejora y dar recomendaciones concretas para reforzarla, como por ejemplo practicar entrevistas simuladas con amigos o mentores, o tomar cursos específicos sobre comunicación efectiva para entrevistas laborales.
5. Un cierre amable y motivador para el candidato, que invite a seguir mejorando y agradezca su participación en el proceso sin decir el resultado del mismo

Hablale directamente al candidato, en tono cercano pero profesional. Máximo 200 palabras.`;
  }
}
