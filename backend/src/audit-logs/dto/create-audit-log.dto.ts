export class CreateAuditLogDto {
    userId: number;
    action: string;
    entity: string;
    entityId?: string;
}