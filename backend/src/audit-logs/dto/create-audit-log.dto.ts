export class CreateAuditLogDto {
    userId: number | null;
    action: string;
    entity: string;
    entity_id?: string;
}