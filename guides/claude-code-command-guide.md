# ⚙️ Control Mode Guide: Building Express Checkout

*Master manual workflow orchestration through a complete e-commerce feature development*

Control mode gives you direct access to specialized workflows defined using slash commands. You choose which workflow to use when, creating custom development processes tailored to your specific needs. Each slash command contains agent-like roles with specific instructions to achieve similar outcomes to traditional AI agents. This guide follows the complete development of an express checkout system to show you how each workflow contributes to production-ready software.

## 🎯 Our Mission: Express Checkout System

**User Story**: "Add express checkout with Apple Pay, Google Pay, guest checkout, and cart abandonment recovery to increase conversion rates"

**Why This Example**: E-commerce checkout touches every layer of development - database design, payment processing, security, performance, and UX. Perfect for showcasing all 8 specialized workflows in realistic scenarios.

**Expected Outcome**: Production-ready express checkout with reduced friction and multiple payment options.

---

## Phase 1: System Architecture & Planning

### 🏗️ Slash Command: `/architect` - System Design

**Goal**: Transform the brain-dump into a comprehensive system specification

```bash
architect "implement express checkout system with Apple Pay, Google Pay, guest checkout options, and abandoned cart recovery email system to increase conversion rates"
```

**What Happens**:
The `/architect` slash command contains specialized instructions that guide the AI to perform system architecture tasks. These instructions define an agent-like role with specific behaviors, similar to how a senior architect would approach the problem.

1. **Requirement Crystallization**: The workflow asks 5 targeted questions:
   - "Should guest checkout save payment methods for future purchases?"
   - "What cart abandonment timeline triggers recovery emails?"
   - "Which regions need Apple/Google Pay support?"
   - "How do we handle failed payment retries?"
   - "What analytics do we need for conversion tracking?"

2. **Codebase Analysis**: The workflow deploys 4 research sub-tasks simultaneously:
   - **Backend Analysis**: Maps existing payment infrastructure, API patterns
   - **Database Analysis**: Analyzes current order/user schemas, payment tables
   - **Frontend Analysis**: Reviews checkout components, state management
   - **Integration Analysis**: Examines payment provider integrations, email systems

3. **Specification Generation**: Creates `docs/SPEC-20250129-express-checkout.md`:
   ```
   ## Database Design
   - New tables: express_checkouts, payment_methods, cart_recovery_campaigns
   - Indexes for performance: payment_method_lookup, abandoned_cart_queries
   
   ## API Specifications  
   - POST /api/express-checkout/initiate
   - POST /api/express-checkout/apple-pay/validate
   - POST /api/express-checkout/complete
   
   ## Implementation Plan
   - 47 sequential tasks across 5 layers
   - Estimated effort: 12 developer-days
   - Key risks: Apple Pay merchant validation, PCI compliance
   ```

**Workflow Output**: 
> **ARCHITECT**, analysis complete with 96% confidence. Generated comprehensive specification with 47 implementation tasks. Key risks identified: Apple Pay merchant validation complexity and cart abandonment email deliverability. Ready to proceed with implementation.

**Time**: 30-45 minutes of interactive requirement gathering

---

## Phase 2: Foundation Implementation

### 🔧 Slash Command: `/engineer` - Database & Backend Implementation

**Goal**: Execute the specification systematically, layer by layer

```bash
engineer "docs/SPEC-20250129-express-checkout.md"
```

**What Happens**:
1. **Task Planning**: Creates todo list of all 47 tasks from specification
2. **Layer-by-Layer Execution**:

   **Database Layer** (Tasks DB-001 to DB-005):
   ```sql
   -- Creates migration files
   CREATE TABLE express_checkouts (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     session_id VARCHAR(255),
     payment_method_type payment_method_enum,
     status checkout_status_enum,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

   **Backend Services** (Tasks BE-001 to BE-015):
   ```typescript
   // Implements ExpressCheckoutService
   class ExpressCheckoutService {
     async initiateCheckout(cartItems: CartItem[], paymentMethod: PaymentMethodType) {
       // Validation, pricing calculation, tax computation
     }
     
     async validateApplePayMerchant(validationURL: string) {
       // Apple Pay merchant validation flow
     }
   }
   ```

   **API Layer** (Tasks API-001 to API-008):
   ```typescript
   // Creates REST endpoints
   router.post('/express-checkout/initiate', 
     validateCart, 
     expressCheckoutController.initiate
   );
   ```

3. **Progress Logging**: Real-time updates appended to SPEC document:
   ```markdown
   ### Layer Completed: Database Layer
   - Status: Completed
   - Timestamp: 2025-01-29 14:30:15
   - Tasks Completed: DB-001 through DB-005
   - Summary: All database migrations created, indexes added for performance
   ```

**Workflow Output**:
> **ENGINEER**, Database and Backend layers completed successfully. 23 of 47 tasks complete. Payment processing infrastructure ready. Starting Frontend layer implementation.

**Time**: 2-3 hours of systematic implementation

---

## Phase 3: Security Analysis & Hardening

### 🔒 Slash Command: `/security` - Payment Security Audit

**Goal**: Ensure PCI compliance and secure payment processing before frontend development

```bash
security "audit express checkout payment processing system for PCI DSS compliance and security vulnerabilities"
```

**What Happens**:
1. **OWASP Security Audit**: Comprehensive analysis across all layers
2. **PCI DSS Compliance Check**: Payment data handling validation
3. **Vulnerability Assessment**:

   **Critical Findings**:
   - Payment tokens stored in localStorage (PCI violation)
   - Apple Pay validation endpoint missing CSRF protection
   - Cart abandonment emails expose order details in URLs

   **Recommendations**:
   ```typescript
   // Secure token handling
   class SecureTokenManager {
     storePaymentToken(token: string) {
       // Use httpOnly cookies instead of localStorage
       // Encrypt tokens with rotating keys
     }
   }
   ```

4. **Security Documentation**: Creates security checklist and monitoring recommendations

**Workflow Output**:
> **SECURITY**, audit complete. Identified 3 critical and 5 medium severity issues. All issues have specific remediation steps. Payment processing requires secure token storage implementation before production deployment.

**Time**: 45 minutes of security analysis + 1 hour of remediation

---

## Phase 4: Frontend Development & UX

### 🔧 Slash Command: `/engineer` - Frontend Implementation

**Goal**: Continue systematic implementation with security fixes integrated

```bash
engineer "docs/SPEC-20250129-express-checkout.md" 
```

**What Happens**: 
1. **Frontend Layer** (Tasks FE-001 to FE-012):
   ```tsx
   // Express checkout component with security fixes
   const ExpressCheckoutButton = ({ cart, onSuccess }: Props) => {
     const { processApplePay, processGooglePay } = useSecurePayments();
     
     return (
       <div className="express-checkout-options">
         <ApplePayButton 
           onAuthorize={processApplePay}
           merchantValidation={validateMerchantSecurely}
         />
         <GooglePayButton onPaymentAuthorized={processGooglePay} />
         <GuestCheckoutButton onInitiate={handleGuestCheckout} />
       </div>
     );
   };
   ```

2. **Integration Layer** (Tasks INT-001 to INT-007):
   - Apple Pay merchant validation with proper security
   - Google Pay API integration with tokenization
   - Email service integration for cart abandonment

**Workflow Output**:
> **ENGINEER**, Frontend and Integration layers completed with security fixes integrated. Express checkout UI implemented with Apple Pay, Google Pay, and guest options. Cart abandonment email system configured.

**Time**: 3-4 hours of frontend development

---

## Phase 5: Performance Optimization

### ⚡ Slash Command: `/performance` - Checkout Speed Optimization

**Goal**: Ensure sub-2-second checkout completion for optimal conversion

```bash
performance "optimize express checkout flow for maximum conversion - target sub-2-second completion time"
```

**What Happens**:
1. **Performance Profiling**: Analyzes checkout flow end-to-end
2. **Bottleneck Identification**:
   - Database queries: Cart calculation taking 800ms
   - API calls: Payment validation adding 600ms  
   - Frontend: Component re-renders causing 400ms delay

3. **Optimization Implementation**:
   ```sql
   -- Database optimization
   CREATE INDEX CONCURRENTLY idx_cart_items_user_active 
   ON cart_items(user_id, created_at) 
   WHERE status = 'active';
   ```

   ```typescript
   // API optimization with caching
   class OptimizedCheckoutService {
     @Cache(300) // 5-minute cache
     async calculatePricing(cartItems: CartItem[]) {
       // Batch calculations, reduce DB round trips
     }
   }
   ```

   ```tsx
   // Frontend optimization with React.memo
   const OptimizedCheckoutButton = React.memo(({ cart }: Props) => {
     const memoizedCalculation = useMemo(() => 
       calculateTotals(cart), [cart.id, cart.updated_at]
     );
   });
   ```

4. **Performance Monitoring**: Sets up tracking for conversion funnel metrics

**Workflow Output**:
> **PERFORMANCE**, optimization complete. Checkout flow reduced from 3.2s to 1.6s average completion time. Database queries optimized (800ms → 200ms), API calls reduced (600ms → 250ms), frontend rendering improved (400ms → 150ms). Conversion tracking implemented.

**Time**: 1-2 hours of optimization work

---

## Phase 6: Quality Assurance & Testing

### 🧹 Slash Command: `/quality` - Code Review & Testing Strategy

**Goal**: Ensure production-ready code quality and comprehensive testing

```bash
quality "review express checkout implementation for code quality, testing coverage, and production readiness"
```

**What Happens**:
1. **Code Structure Analysis**: Reviews implementation patterns and maintainability
2. **Testing Gap Analysis**: Identifies missing test coverage
3. **Quality Improvements**:

   **Code Structure Recommendations**:
   ```typescript
   // Improved error handling
   class CheckoutError extends Error {
     constructor(
       message: string, 
       public code: string,
       public retryable: boolean = false
     ) {
       super(message);
     }
   }
   ```

   **Testing Strategy**:
   ```typescript
   // Unit tests for payment processing
   describe('ExpressCheckoutService', () => {
     it('should handle Apple Pay authorization', async () => {
       const result = await service.processApplePay(mockPaymentData);
       expect(result.status).toBe('completed');
     });
   });

   // Integration tests for full flow
   describe('Express Checkout Flow', () => {
     it('should complete guest checkout end-to-end', async () => {
       // Test complete user journey
     });
   });
   ```

4. **Production Readiness Checklist**: Creates deployment verification steps

**Workflow Output**:
> **QUALITY**, code review complete. Implementation follows best practices with 95% test coverage. Identified 3 minor refactoring opportunities and added comprehensive error handling. Production deployment checklist created with 12 verification steps.

**Time**: 1 hour of quality analysis + 30 minutes of improvements

---

## Phase 7: User Experience Validation

### 👥 Slash Command: `/user` - Real User Testing

**Goal**: Validate checkout experience with realistic user scenarios

```bash
user "test express checkout flow with different user personas - new customer, returning customer, mobile user, desktop user"
```

**What Happens**:
1. **User Persona Simulation**: Creates realistic test scenarios
2. **User Journey Testing**:

   **New Customer Journey**:
   - Discovers product → adds to cart → sees express checkout options
   - Tests Apple Pay: "Finds Apple Pay button immediately, completes in 1.2s"
   - Tests guest checkout: "Form auto-fills correctly, payment succeeds"

   **Returning Customer Journey**: 
   - Login → cart recovery → express checkout with saved payment
   - "Saved payment methods load instantly, one-click completion works"

   **Mobile Safari Testing**:
   - Tests touch targets, payment sheet behavior
   - "Apple Pay sheet renders correctly, form fields are thumb-friendly"

3. **Friction Point Analysis**:
   - "Guest email validation too strict - rejects valid emails with plus signs"
   - "Cart abandonment email arrives 2 hours late - should be 30 minutes"
   - "Google Pay button not visible on small screens"

4. **UX Improvement Recommendations**:
   ```tsx
   // Improved email validation
   const isValidEmail = (email: string) => {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // More permissive
   };

   // Responsive payment buttons
   <div className="payment-buttons responsive-grid">
     <ApplePayButton className="full-width-mobile" />
     <GooglePayButton className="full-width-mobile" />
   </div>
   ```

**Workflow Output**:
> **USER**, UX validation complete across 4 personas and 6 devices. Express checkout reduces steps for both new and returning customers. Identified 3 friction points with specific fixes. Mobile experience optimized for better conversion.

**Time**: 45 minutes of user journey testing

---

## Phase 8: Final Implementation & Deployment

### 🔧 Slash Command: `/engineer` - UX Fixes & Final Integration  

**Goal**: Implement user feedback and prepare for production deployment

```bash
engineer "docs/SPEC-20250129-express-checkout.md" debug "implement UX improvements identified in user testing"
```

**What Happens**:
1. **UX Fix Implementation**: Addresses all friction points identified by user workflow
2. **Final Integration Testing**: Validates all components work together
3. **Deployment Preparation**: 
   - Environment configuration
   - Feature flags for gradual rollout
   - Monitoring and alerting setup

**Workflow Output**:
> **ENGINEER**, UX improvements implemented and tested. Express checkout system ready for production deployment. Feature flags configured for 10% → 50% → 100% rollout. All monitoring and alerting in place.

**Time**: 1 hour of final fixes and deployment prep

---

## 🏁 Control Mode Results: What We Built

### 📊 Complete Feature Delivered
- **Express checkout with Apple Pay/Google Pay**: Fast completion experience
- **Guest checkout**: Streamlined form with fewer required fields  
- **Cart abandonment recovery**: Automated email system with configurable timing
- **Security compliance**: Full PCI DSS compliance with encrypted token storage
- **Performance optimized**: Fast checkout completion experience
- **Mobile optimized**: Touch-friendly interface optimized for mobile devices

### 🎯 Business Impact
- **Improved conversion**: Reduced friction in checkout process
- **Mobile experience**: Optimized for thumb navigation and quick completion
- **Cart recovery**: Automated system to recapture abandoned purchases
- **Payment flexibility**: Multiple options reduce checkout abandonment

### ⏰ Development Time: Control Mode Analysis
- **Total time**: 8-10 hours of focused development
- **Key advantage**: Each workflow's specialized instructions help prevent common mistakes

---

## 🧠 Control Mode Mastery Lessons

### 1. Workflow Sequencing Matters
**Optimal Flow**: Architect → Engineer → Security → Engineer → Performance → Quality → User → Engineer

**Why**: Each workflow builds on previous work, and engineer implements fixes from other workflows immediately.

### 2. Use Security Early
Running security audit after database/backend but before frontend prevents rework. Security issues found after full implementation cost 3x more time to fix.

### 3. Performance + User Work Together  
Performance workflow finds technical bottlenecks, user workflow finds UX friction. Together they create both fast AND intuitive experiences.

### 4. Quality Before Production
Quality workflow's production readiness checklist helps prevent deployment issues. The time spent here reduces troubleshooting later.

### 5. Engineer is Your Integration Hub
Engineer workflow handles implementation from multiple workflows seamlessly. Use it to integrate findings from security, performance, quality, and user workflows.

---

## 🔄 When to Choose Control Mode

### Perfect Scenarios:
- **Learning the system**: Understanding what each workflow contributes
- **Complex features**: Need deep analysis from multiple perspectives  
- **Custom workflows**: Your process doesn't match standard patterns
- **Specialized needs**: Heavy focus on security, performance, or UX
- **Legacy integration**: Requires careful analysis of existing systems

### Use Auto Mode Instead When:
- **Standard feature development**: Typical CRUD operations
- **Time pressure**: Need fastest path to working feature
- **Less experienced team**: Want guided workflow without decisions
- **Routine tasks**: Bug fixes, minor enhancements

---

## 🚀 Next Steps: Master Your Workflow Orchestra

1. **Practice the Flow**: Try this checkout example in your own codebase
2. **Experiment with Sequences**: Try different workflow orders for different outcomes
3. **Create Custom Patterns**: Build your own multi-workflow processes  
4. **Document Your Wins**: Track what workflow combinations work best for your projects

Control mode gives you the power to orchestrate specialized workflows like a conductor leading an orchestra. Each workflow contributes its expertise at exactly the right moment, creating software that no single perspective could achieve.

Master this, and you've mastered systematic AI-powered development.

---

*Ready to try auto mode? See how the same checkout feature gets built with automated workflow coordination in the [Auto Mode Guide](claude-code-auto-mode-guide.md).*