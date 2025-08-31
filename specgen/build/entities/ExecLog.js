/**
 * ExecLog entity - Execution logs for specification implementations
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
let ExecLog = class ExecLog {
    id;
    specId;
    layer;
    status;
    summary;
    tasksCompleted;
    createdAt;
    spec;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ExecLog.prototype, "id", void 0);
__decorate([
    Column({ name: 'spec_id' }),
    __metadata("design:type", Number)
], ExecLog.prototype, "specId", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ExecLog.prototype, "layer", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ExecLog.prototype, "status", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ExecLog.prototype, "summary", void 0);
__decorate([
    Column({ type: 'text', nullable: true, name: 'tasks_completed' }),
    __metadata("design:type", String)
], ExecLog.prototype, "tasksCompleted", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at' }),
    __metadata("design:type", Date)
], ExecLog.prototype, "createdAt", void 0);
__decorate([
    ManyToOne("Spec", { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'spec_id' }),
    __metadata("design:type", Object)
], ExecLog.prototype, "spec", void 0);
ExecLog = __decorate([
    Entity('exec_logs')
], ExecLog);
export { ExecLog };
//# sourceMappingURL=ExecLog.js.map