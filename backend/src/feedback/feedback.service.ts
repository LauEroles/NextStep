import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { Scorecard } from '../scorecards/entities/scorecard.entity';
import { JobApplication } from '../job-applications/entities/job-application.entity';
import { GeminiService } from './gemini.service';
import { CvService } from '../cv/cv.service';


@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Scorecard)
    private readonly scorecardRepository: Repository<Scorecard>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    private readonly geminiService: GeminiService,
    private readonly cvService: CvService,
  ) { }



  async create(createFeedbackDto: CreateFeedbackDto, recruiterId: number) {
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

  async findByApplicationForUser(applicationId: number, userId: number) {
    return await this.feedbackRepository.find({
      where: {
        application: { id: applicationId, applicant: { id: userId } },
      },
      relations: ['application', 'stage', 'recruiter'],
      order: { stage: { sequenceOrder: 'ASC' } },
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

  async generatePublicFeedback(applicationId: number) {
    // 1. Traer la postulación con jobOffer y applicant
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['jobOffer', 'jobOffer.seniority', 'applicant'],
    });
    if (!application) {
      throw new NotFoundException('No se encontró la postulación.');
    }

    // 2. Traer todos los feedbacks de esa postulación, con sus stages
    const feedbacks = await this.feedbackRepository.find({
      where: { application: { id: applicationId } },
      relations: ['stage'],
      order: { stage: { sequenceOrder: 'ASC' } },
    });

    if (feedbacks.length === 0) {
      throw new NotFoundException(
        'No hay feedbacks cargados para esta postulación.',
      );
    }

    // 3. Traer las scorecards de todos esos feedbacks
    const feedbackIds = feedbacks.map((f) => f.id);
    const scorecards = await this.scorecardRepository
      .createQueryBuilder('scorecard')
      .where('scorecard.feedback_id IN (:...ids)', { ids: feedbackIds })
      .getMany();

    // 4. Traer el CV del candidato (si tiene)
    const cv = await this.cvService.getLatestCvByUser(
      application.applicant.id,
    );

    // 5. Armar el prompt para Gemini
    const prompt = this.buildPrompt(application, feedbacks, scorecards, cv);

    // 6. Llamar a Gemini
    const generatedText = await this.geminiService.generateFeedback(prompt);

    // 7. Guardar el resultado en publicFeedback de TODOS los feedbacks de esa postulación
    for (const fb of feedbacks) {
      fb.publicFeedback = generatedText;
    }
    await this.feedbackRepository.save(feedbacks);

    return { publicFeedback: generatedText };
  }

  private buildPrompt(
    application: JobApplication,
    feedbacks: Feedback[],
    scorecards: Scorecard[],
    cv: { originalName: string } | null,
  ): string {
    const jobInfo = `Vacante: ${application.jobOffer.title}
Descripción: ${application.jobOffer.description}
Seniority requerido: ${application.jobOffer.seniority?.name ?? 'No especificado'}`;

    const feedbackTexts = feedbacks
      .map(
        (fb) =>
          `Etapa "${fb.stage?.name}": ${fb.comment ?? 'Sin comentarios'}`,
      )
      .join('\n');

    const scorecardTexts = scorecards
      .map((sc) => `${sc.skillName} (${sc.type}): ${sc.score}/10`)
      .join('\n');

    const cvInfo = cv
      ? `El candidato adjuntó un CV llamado "${cv.originalName}".`
      : 'El candidato no adjuntó CV.';

    return `Actuá como un especialista en RRHH redactando feedback constructivo para un candidato que participó de un proceso de selección.

DATOS DE LA VACANTE:
${jobInfo}

NOTAS DE LOS ENTREVISTADORES POR ETAPA:
${feedbackTexts}

EVALUACIONES (SCORECARDS):
${scorecardTexts || 'No se registraron scorecards.'}

${cvInfo}

Generá un feedback profesional, empático y constructivo para el candidato, en español, que incluya:
1. Un resumen general de su desempeño en el proceso
2. Puntos fuertes identificados
3. Áreas de mejora con recomendaciones concretas de cómo reforzarlas
4. Un cierre alentador

No uses lenguaje técnico de RRHH interno (como "scorecard" o "etapa"), hablale directamente al candidato como si fueras quien lo entrevistó. Máximo 300 palabras.`;
  }
}

