/**
 * IssueLog entity - Issue and error logs for debugging
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
let IssueLog = class IssueLog {
    id;
    specId;
    taskId;
    taskDescription;
    layer;
    status;
    error;
    rootCause;
    resolution;
    createdAt;
    spec;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], IssueLog.prototype, "id", void 0);
__decorate([
    Column({ name: 'spec_id' }),
    __metadata("design:type", Number)
], IssueLog.prototype, "specId", void 0);
__decorate([
    Column({ type: 'text', name: 'task_id' }),
    __metadata("design:type", String)
], IssueLog.prototype, "taskId", void 0);
__decorate([
    Column({ type: 'text', name: 'task_description' }),
    __metadata("design:type", String)
], IssueLog.prototype, "taskDescription", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], IssueLog.prototype, "layer", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], IssueLog.prototype, "status", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], IssueLog.prototype, "error", void 0);
__decorate([
    Column({ type: 'text', nullable: true, name: 'root_cause' }),
    __metadata("design:type", String)
], IssueLog.prototype, "rootCause", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], IssueLog.prototype, "resolution", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at' }),
    __metadata("design:type", Date)
], IssueLog.prototype, "createdAt", void 0);
__decorate([
    ManyToOne("Spec", { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'spec_id' }),
    __metadata("design:type", Object)
], IssueLog.prototype, "spec", void 0);
IssueLog = __decorate([
    Entity('issue_logs')
], IssueLog);
export { IssueLog };
//# sourceMappingURL=IssueLog.js.map