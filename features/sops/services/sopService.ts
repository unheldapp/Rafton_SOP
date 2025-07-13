import { api } from '../../../api';
import { transformApiSopToSop, transformApiWorkingCopyToWorkingCopy, transformApiTemplateToTemplate } from '../../../api/transformers';
import type { SOPFormData, SOPFilters, WorkingCopyFormData, TemplateFormData, SOPAssignmentData, SOPExportOptions } from '../types';
import type { SOP, WorkingCopy, Template } from '../../../shared/types';

export class SOPService {
  // SOP Management
  async getSops(filters: SOPFilters = {}): Promise<{
    sops: SOP[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await api.sops.getSops(filters);
      
      return {
        sops: response.sops.map(transformApiSopToSop),
        total: response.total,
        page: response.page,
        limit: response.limit,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch SOPs');
    }
  }

  async getSop(id: string): Promise<SOP> {
    try {
      const apiSop = await api.sops.getSop(id);
      return transformApiSopToSop(apiSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch SOP');
    }
  }

  async createSop(sopData: SOPFormData): Promise<SOP> {
    try {
      const apiSop = await api.sops.createSop(sopData);
      return transformApiSopToSop(apiSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create SOP');
    }
  }

  async updateSop(id: string, sopData: Partial<SOPFormData>): Promise<SOP> {
    try {
      const apiSop = await api.sops.updateSop(id, sopData);
      return transformApiSopToSop(apiSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update SOP');
    }
  }

  async deleteSop(id: string): Promise<void> {
    try {
      await api.sops.deleteSop(id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete SOP');
    }
  }

  // Version Control
  async getSOPVersions(sopId: string): Promise<SOP[]> {
    try {
      const apiSops = await api.sops.getSOPVersions(sopId);
      return apiSops.map(transformApiSopToSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch SOP versions');
    }
  }

  // Working Copies
  async getWorkingCopies(sopId?: string): Promise<WorkingCopy[]> {
    try {
      const apiWorkingCopies = await api.sops.getWorkingCopies(sopId);
      return apiWorkingCopies.map(transformApiWorkingCopyToWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch working copies');
    }
  }

  async getWorkingCopy(id: string): Promise<WorkingCopy> {
    try {
      const apiWorkingCopy = await api.sops.getWorkingCopy(id);
      return transformApiWorkingCopyToWorkingCopy(apiWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch working copy');
    }
  }

  async createWorkingCopy(sopId: string): Promise<WorkingCopy> {
    try {
      const apiWorkingCopy = await api.sops.createWorkingCopy(sopId);
      return transformApiWorkingCopyToWorkingCopy(apiWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create working copy');
    }
  }

  async updateWorkingCopy(id: string, content: string): Promise<WorkingCopy> {
    try {
      const apiWorkingCopy = await api.sops.updateWorkingCopy(id, content);
      return transformApiWorkingCopyToWorkingCopy(apiWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update working copy');
    }
  }

  async submitForReview(sopId: string, changes: string[], reviewNotes?: string): Promise<WorkingCopy> {
    try {
      const apiWorkingCopy = await api.sops.submitForReview({
        sopId,
        changes,
        reviewNotes,
      });
      return transformApiWorkingCopyToWorkingCopy(apiWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to submit for review');
    }
  }

  async reviewWorkingCopy(workingCopyId: string, decision: 'approved' | 'rejected', reviewNotes?: string): Promise<WorkingCopy> {
    try {
      const apiWorkingCopy = await api.sops.reviewWorkingCopy({
        workingCopyId,
        decision,
        reviewNotes,
      });
      return transformApiWorkingCopyToWorkingCopy(apiWorkingCopy);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to review working copy');
    }
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    try {
      const apiTemplates = await api.sops.getTemplates();
      return apiTemplates.map(transformApiTemplateToTemplate);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch templates');
    }
  }

  async getTemplate(id: string): Promise<Template> {
    try {
      const apiTemplate = await api.sops.getTemplate(id);
      return transformApiTemplateToTemplate(apiTemplate);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch template');
    }
  }

  async createTemplate(templateData: TemplateFormData): Promise<Template> {
    try {
      const apiTemplate = await api.sops.createTemplate({
        ...templateData,
        isActive: true,
      });
      return transformApiTemplateToTemplate(apiTemplate);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create template');
    }
  }

  async updateTemplate(id: string, templateData: Partial<TemplateFormData>): Promise<Template> {
    try {
      const apiTemplate = await api.sops.updateTemplate(id, templateData);
      return transformApiTemplateToTemplate(apiTemplate);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update template');
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await api.sops.deleteTemplate(id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete template');
    }
  }

  // SOP Assignment
  async assignSOP(assignmentData: SOPAssignmentData): Promise<void> {
    try {
      await api.sops.assignSOP(assignmentData);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to assign SOP');
    }
  }

  async getUserSOPs(userId: string): Promise<SOP[]> {
    try {
      const apiSops = await api.sops.getUserSOPs(userId);
      return apiSops.map(transformApiSopToSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user SOPs');
    }
  }

  // Categories and Tags
  async getCategories(): Promise<string[]> {
    try {
      return await api.sops.getCategories();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }

  // Export/Import
  async exportSOP(id: string, options: SOPExportOptions): Promise<Blob> {
    try {
      return await api.sops.exportSOP(id, options.format);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to export SOP');
    }
  }

  // Search
  async searchSOPs(query: string, filters: SOPFilters = {}): Promise<SOP[]> {
    try {
      const searchFilters = {
        ...filters,
        search: query,
      };
      const response = await api.sops.getSops(searchFilters);
      return response.sops.map(transformApiSopToSop);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to search SOPs');
    }
  }

  // Bulk Operations
  async bulkAssignSOPs(sopIds: string[], userIds: string[], dueDate?: string): Promise<void> {
    try {
      // Assign each SOP to all users
      await Promise.all(
        sopIds.map(sopId =>
          api.sops.assignSOP({
            sopId,
            userIds,
            dueDate,
          })
        )
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk assign SOPs');
    }
  }

  async bulkUpdateSOPs(sopIds: string[], updates: Partial<SOPFormData>): Promise<void> {
    try {
      await Promise.all(
        sopIds.map(sopId =>
          api.sops.updateSop(sopId, updates)
        )
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk update SOPs');
    }
  }

  async bulkDeleteSOPs(sopIds: string[]): Promise<void> {
    try {
      await Promise.all(
        sopIds.map(sopId =>
          api.sops.deleteSop(sopId)
        )
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk delete SOPs');
    }
  }

  // Validation
  validateSOPData(sopData: SOPFormData): string[] {
    const errors: string[] = [];

    if (!sopData.title.trim()) {
      errors.push('Title is required');
    }

    if (!sopData.description.trim()) {
      errors.push('Description is required');
    }

    if (!sopData.content.trim()) {
      errors.push('Content is required');
    }

    if (!sopData.category.trim()) {
      errors.push('Category is required');
    }

    if (!sopData.department.trim()) {
      errors.push('Department is required');
    }

    if (sopData.effectiveDate && sopData.expiryDate) {
      const effectiveDate = new Date(sopData.effectiveDate);
      const expiryDate = new Date(sopData.expiryDate);
      
      if (effectiveDate >= expiryDate) {
        errors.push('Effective date must be before expiry date');
      }
    }

    return errors;
  }

  validateTemplateData(templateData: TemplateFormData): string[] {
    const errors: string[] = [];

    if (!templateData.name.trim()) {
      errors.push('Template name is required');
    }

    if (!templateData.description.trim()) {
      errors.push('Template description is required');
    }

    if (!templateData.content.trim()) {
      errors.push('Template content is required');
    }

    if (!templateData.category.trim()) {
      errors.push('Template category is required');
    }

    return errors;
  }
}

// Export singleton instance
export const sopService = new SOPService(); 