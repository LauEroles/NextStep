import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FeedbackModule } from "./feedback/feedback.module";
import { AuthModule } from "./auth/auth.module";
import { JobOffersModule } from "./job-offers/job-offers.module";
import { JobApplicationsModule } from "./job-applications/job-applications.module";
import { RolesModule } from "./roles/roles.module";
import { StagesModule } from "./stages/stages.module";
import { SeniorityModule } from "./seniority/seniority.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { AppModule } from "./app.module";
import { UsersModule } from "./users/users.module";

describe("app.module",()=>{
    
      beforeEach(async () => {
        let appController:AppController;
        let appService:AppService;
        let usersModule:UsersModule;
        let feedbackModule:FeedbackModule;
        let authModule:AuthModule;
        let jobOfertModule:JobOffersModule;
        let jobApplicationsModule:JobApplicationsModule;
        let rolesModule:RolesModule;
        let stangesModule:StagesModule;
        let seniorityModule:SeniorityModule;
        let auditLogsModule:AuditLogsModule;
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports:[AppModule],
        }).compile();
    
        appController = moduleRef.get<AppController>(AppController);
        appService = moduleRef.get<AppService>(AppService);
        usersModule = moduleRef.get<UsersModule>(UsersModule);
        feedbackModule = moduleRef.get<FeedbackModule>(FeedbackModule);
        authModule = moduleRef.get<AuthModule>(AuthModule);
        jobOfertModule = moduleRef.get<JobOffersModule>(JobOffersModule);
        jobApplicationsModule = moduleRef.get<JobApplicationsModule>(JobApplicationsModule);
        rolesModule = moduleRef.get<RolesModule>(RolesModule);
        stangesModule = moduleRef.get<StagesModule>(StagesModule);
        seniorityModule = moduleRef.get<SeniorityModule>(SeniorityModule);
        auditLogsModule = moduleRef.get<AuditLogsModule>(AuditLogsModule);



      });
        it("obvservar que todos los elementos esten definidos",()=>{
            expect(appController).toBeDefined();
            expect(appService).toBeDefined();
            expect(usersModule).toBeDefined();
            expect(feedbackModule).toBeDefined();
            expect(authModule).toBeDefined();
            expect(jobOfertModule).toBeDefined();
            expect(jobApplicationsModule).toBeDefined(); 
            expect(rolesModule).toBeDefined();
            expect(stangesModule).toBeDefined();
            expect(seniorityModule).toBeDefined();
            expect(auditLogsModule).toBeDefined();
        })
})