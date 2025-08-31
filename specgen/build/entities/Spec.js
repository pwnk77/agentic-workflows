/**
 * Spec entity - Main specification document
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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
let Spec = class Spec {
    id;
    title;
    bodyMd;
    status;
    createdAt;
    updatedAt;
    version;
    todos;
    execLogs;
    issueLogs;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Spec.prototype, "id", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Spec.prototype, "title", void 0);
__decorate([
    Column({ type: 'text', name: 'body_md' }),
    __metadata("design:type", String)
], Spec.prototype, "bodyMd", void 0);
__decorate([
    Column({ type: 'text', default: 'draft' }),
    __metadata("design:type", String)
], Spec.prototype, "status", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at' }),
    __metadata("design:type", Date)
], Spec.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Spec.prototype, "updatedAt", void 0);
__decorate([
    Column({ type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], Spec.prototype, "version", void 0);
__decorate([
    OneToMany('Todo', (todo) => todo.spec, { cascade: true }),
    __metadata("design:type", Array)
], Spec.prototype, "todos", void 0);
__decorate([
    OneToMany('ExecLog', (log) => log.spec, { cascade: true }),
    __metadata("design:type", Array)
], Spec.prototype, "execLogs", void 0);
__decorate([
    OneToMany('IssueLog', (issue) => issue.spec, { cascade: true }),
    __metadata("design:type", Array)
], Spec.prototype, "issueLogs", void 0);
Spec = __decorate([
    Entity('specs')
], Spec);
export { Spec };
//# sourceMappingURL=Spec.js.map