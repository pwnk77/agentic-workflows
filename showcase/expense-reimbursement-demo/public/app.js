// Expense Reimbursement Demo - Alpine.js Application
function expenseApp() {
    return {
        // Application state
        loading: false,
        currentUser: null,
        selectedRole: 'employee@demo.com',
        claims: [],
        selectedClaim: null,
        
        // UI state - unified modal system
        modal: {
            show: false,
            type: '', // 'submit', 'review', 'details', 'process'
            title: '',
            size: 'default' // 'default', 'large', 'small'
        },
        // Legacy modal states (keeping for backward compatibility)
        showSubmissionForm: false,
        showReviewModal: false,
        showDetailsModal: false,
        showProcessModal: false,
        
        // Form state
        submitting: false,
        reviewing: false,
        processing: false,
        
        // Form data
        newClaim: {
            amount: '',
            category: '',
            expense_date: '',
            description: '',
            receipt_data: null,
            receipt_filename: null
        },
        
        reviewForm: {
            action: '',
            comments: ''
        },
        
        processForm: {
            payment_date: '',
            payment_method: 'bank_transfer',
            reference_number: ''
        },
        
        // Error handling
        submissionErrors: [],
        reviewErrors: [],
        processErrors: [],
        notification: '',
        error: '',
        
        // Computed properties
        today: new Date().toISOString().split('T')[0],
        
        // Initialize app
        async init() {
            await this.checkAuth();
            if (this.currentUser) {
                await this.loadClaims();
            }
        },
        
        // Authentication methods
        async login() {
            this.loading = true;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.selectedRole })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.currentUser = data.user;
                    await this.loadClaims();
                    this.showNotification('Login successful');
                } else {
                    this.showError(data.error);
                }
            } catch (error) {
                this.showError('Login failed');
            } finally {
                this.loading = false;
            }
        },
        
        async logout() {
            this.loading = true;
            try {
                await fetch('/api/logout', { method: 'POST' });
                this.currentUser = null;
                this.claims = [];
                this.closeAllModals();
                this.showNotification('Logged out successfully');
            } catch (error) {
                this.showError('Logout failed');
            } finally {
                this.loading = false;
            }
        },
        
        async switchRole() {
            if (this.currentUser && this.selectedRole !== this.currentUser.email) {
                await this.login();
            }
        },
        
        async checkAuth() {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.selectedRole = data.user.email;
                }
            } catch (error) {
                console.log('Not authenticated');
            }
        },
        
        // Claims management
        async loadClaims() {
            this.loading = true;
            try {
                const response = await fetch('/api/claims');
                const data = await response.json();
                
                if (response.ok) {
                    this.claims = data.claims;
                } else {
                    this.showError(data.error);
                }
            } catch (error) {
                this.showError('Failed to load claims');
            } finally {
                this.loading = false;
            }
        },
        
        // Claim submission
        async submitClaim() {
            this.submissionErrors = [];
            this.submitting = true;
            
            try {
                // Client-side validation
                const errors = this.validateClaimSubmission();
                if (errors.length > 0) {
                    this.submissionErrors = errors;
                    return;
                }
                
                const response = await fetch('/api/claims', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newClaim)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.showNotification('Claim submitted successfully');
                    this.resetClaimForm();
                    this.showSubmissionForm = false;
                    await this.loadClaims();
                } else {
                    if (data.errors) {
                        this.submissionErrors = data.errors;
                    } else {
                        this.showError(data.error);
                    }
                }
            } catch (error) {
                this.showError('Failed to submit claim');
            } finally {
                this.submitting = false;
            }
        },
        
        validateClaimSubmission() {
            const errors = [];
            
            if (!this.newClaim.amount || parseFloat(this.newClaim.amount) <= 0) {
                errors.push('Amount must be a positive number');
            }
            
            if (parseFloat(this.newClaim.amount) > 10000) {
                errors.push('Amount cannot exceed $10,000');
            }
            
            if (!this.newClaim.category) {
                errors.push('Category is required');
            }
            
            if (!this.newClaim.expense_date) {
                errors.push('Expense date is required');
            } else {
                const expenseDate = new Date(this.newClaim.expense_date);
                const today = new Date();
                if (expenseDate > today) {
                    errors.push('Expense date cannot be in the future');
                }
            }
            
            return errors;
        },
        
        resetClaimForm() {
            this.newClaim = {
                amount: '',
                category: '',
                expense_date: '',
                description: '',
                receipt_data: null,
                receipt_filename: null
            };
            this.submissionErrors = [];
        },
        
        // File upload handling
        handleReceiptUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.processReceiptFile(file);
            }
        },
        
        handleReceiptDrop(event) {
            event.currentTarget.classList.remove('dragover');
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processReceiptFile(file);
            }
        },
        
        processReceiptFile(file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                this.showError('File size must be less than 5MB');
                return;
            }
            
            // Check file type
            if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
                this.showError('Only JPEG and PNG images are allowed');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.newClaim.receipt_data = e.target.result;
                this.newClaim.receipt_filename = file.name;
            };
            reader.readAsDataURL(file);
        },
        
        removeReceipt() {
            this.newClaim.receipt_data = null;
            this.newClaim.receipt_filename = null;
        },
        
        // Claim review (Manager)
        openReviewModal(claim) {
            this.selectedClaim = claim;
            this.reviewForm = { action: '', comments: '' };
            this.reviewErrors = [];
            this.openModal('review', 'Review Expense Claim', 'default');
        },
        
        closeReviewModal() {
            this.showReviewModal = false;
            this.selectedClaim = null;
            this.reviewForm = { action: '', comments: '' };
            this.reviewErrors = [];
        },
        
        async submitReview() {
            this.reviewErrors = [];
            this.reviewing = true;
            
            try {
                // Client-side validation
                if (!this.reviewForm.action) {
                    this.reviewErrors = ['Please select approve or reject'];
                    return;
                }
                
                if (this.reviewForm.action === 'rejected' && !this.reviewForm.comments?.trim()) {
                    this.reviewErrors = ['Comments are required when rejecting a claim'];
                    return;
                }
                
                const response = await fetch(`/api/claims/${this.selectedClaim.id}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.reviewForm)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.showNotification(`Claim ${this.reviewForm.action} successfully`);
                    this.closeReviewModal();
                    await this.loadClaims();
                } else {
                    if (data.errors) {
                        this.reviewErrors = data.errors;
                    } else {
                        this.showError(data.error);
                    }
                }
            } catch (error) {
                this.showError('Failed to submit review');
            } finally {
                this.reviewing = false;
            }
        },
        
        // Claim processing (Finance)
        openProcessModal(claim) {
            this.selectedClaim = claim;
            this.processForm = {
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'bank_transfer',
                reference_number: ''
            };
            this.processErrors = [];
            this.openModal('process', 'Process Payment', 'default');
        },
        
        closeProcessModal() {
            this.showProcessModal = false;
            this.selectedClaim = null;
            this.processForm = {
                payment_date: '',
                payment_method: 'bank_transfer',
                reference_number: ''
            };
            this.processErrors = [];
        },
        
        async submitPayment() {
            this.processErrors = [];
            this.processing = true;
            
            try {
                // Client-side validation
                if (!this.processForm.payment_date) {
                    this.processErrors = ['Payment date is required'];
                    return;
                }
                
                const response = await fetch(`/api/claims/${this.selectedClaim.id}/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.processForm)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.showNotification('Payment processed successfully');
                    this.closeProcessModal();
                    await this.loadClaims();
                } else {
                    if (data.errors) {
                        this.processErrors = data.errors;
                    } else {
                        this.showError(data.error);
                    }
                }
            } catch (error) {
                this.showError('Failed to process payment');
            } finally {
                this.processing = false;
            }
        },
        
        // Claim details viewing
        viewClaimDetails(claim) {
            this.selectedClaim = claim;
            this.openModal('details', 'Expense Claim Details', 'large');
        },
        
        closeDetailsModal() {
            this.showDetailsModal = false;
            this.selectedClaim = null;
        },
        
        // Unified modal methods
        openModal(type, title = '', size = 'default') {
            this.modal.show = true;
            this.modal.type = type;
            this.modal.title = title;
            this.modal.size = size;
            
            // Update legacy states for backward compatibility
            switch(type) {
                case 'submit':
                    this.showSubmissionForm = true;
                    break;
                case 'review':
                    this.showReviewModal = true;
                    break;
                case 'details':
                    this.showDetailsModal = true;
                    break;
                case 'process':
                    this.showProcessModal = true;
                    break;
            }
        },

        closeModal() {
            this.modal.show = false;
            this.modal.type = '';
            this.modal.title = '';
            this.closeAllModals();
        },

        // Utility methods
        closeAllModals() {
            this.showSubmissionForm = false;
            this.showReviewModal = false;
            this.showDetailsModal = false;
            this.showProcessModal = false;
        },
        
        getDashboardTitle() {
            if (!this.currentUser) return 'Dashboard';
            
            switch (this.currentUser.role) {
                case 'employee': return 'My Expense Claims';
                case 'manager': return 'Claims for Review';
                case 'finance': return 'Claims for Processing';
                default: return 'Dashboard';
            }
        },
        
        getClaimsListTitle() {
            if (!this.currentUser) return 'Claims';
            
            switch (this.currentUser.role) {
                case 'employee': return 'Your Claims History';
                case 'manager': return 'All Claims Requiring Review';
                case 'finance': return 'Approved Claims for Payment';
                default: return 'Claims';
            }
        },
        
        getStatusClass(status) {
            switch (status) {
                case 'pending_review': return 'status-pending';
                case 'approved': return 'status-approved';
                case 'rejected': return 'status-rejected';
                case 'paid': return 'status-paid';
                default: return 'bg-gray-100 text-gray-800';
            }
        },
        
        getStatusText(status) {
            switch (status) {
                case 'pending_review': return 'Pending Review';
                case 'approved': return 'Approved';
                case 'rejected': return 'Rejected';
                case 'paid': return 'Paid';
                default: return status;
            }
        },
        
        canReviewClaim(claim) {
            return this.currentUser?.role === 'manager' && claim.status === 'pending_review';
        },
        
        canProcessClaim(claim) {
            return this.currentUser?.role === 'finance' && claim.status === 'approved';
        },
        
        // Notification system
        showNotification(message) {
            this.notification = message;
            this.error = '';
            setTimeout(() => {
                this.notification = '';
            }, 3000);
        },
        
        showError(message) {
            this.error = message;
            this.notification = '';
            setTimeout(() => {
                this.error = '';
            }, 5000);
        }
    }
}