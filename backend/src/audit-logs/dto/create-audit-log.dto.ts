export class CreateAuditLogDto {
    userId: number | null;
    action: string;
    entity: string;
    entityId: number;
}