/**
 * Todo entity - Task items associated with specifications
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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
let Todo = class Todo {
    id;
    specId;
    stepNo;
    text;
    status;
    spec;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Todo.prototype, "id", void 0);
__decorate([
    Column({ name: 'spec_id' }),
    __metadata("design:type", Number)
], Todo.prototype, "specId", void 0);
__decorate([
    Column({ type: 'integer', nullable: true, name: 'step_no' }),
    __metadata("design:type", Number)
], Todo.prototype, "stepNo", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Todo.prototype, "text", void 0);
__decorate([
    Column({ type: 'text', default: 'pending' }),
    __metadata("design:type", String)
], Todo.prototype, "status", void 0);
__decorate([
    ManyToOne("Spec", { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'spec_id' }),
    __metadata("design:type", Object)
], Todo.prototype, "spec", void 0);
Todo = __decorate([
    Entity('todos')
], Todo);
export { Todo };
//# sourceMappingURL=Todo.js.map