/**
 * Tests for dashboard admin pages
 */

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { capexCategoriesMock, capexRulesMock } = vi.hoisted(() => ({
  capexCategoriesMock: vi.fn(() => <div data-testid="capex-categories" />),
  capexRulesMock: vi.fn(() => <div data-testid="capex-rules" />),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/features/admin/admin-dashboard', () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard" />,
}));

vi.mock('@/components/features/admin/audit-log-viewer', () => ({
  AuditLogViewer: () => <div data-testid="audit-log-viewer" />,
}));

vi.mock('@/components/features/admin/capex-categories-list', () => ({
  CapexCategoriesList: capexCategoriesMock,
}));

vi.mock('@/components/features/admin/capex-rules-list', () => ({
  CapexRulesList: capexRulesMock,
}));

vi.mock('@/components/features/admin/curriculum-templates-list', () => ({
  CurriculumTemplatesList: () => <div data-testid="curriculum-templates" />,
}));

vi.mock('@/components/features/admin/rent-templates-list', () => ({
  RentTemplatesList: () => <div data-testid="rent-templates" />,
}));

vi.mock('@/components/features/admin/workspace-settings', () => ({
  WorkspaceSettings: () => <div data-testid="workspace-settings" />,
}));

vi.mock('@/components/features/compare/comparison-view', () => ({
  ComparisonView: () => <div data-testid="comparison-view" />,
}));

vi.mock('@/lib/auth/session', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: {
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: 'token',
    expiresAt: new Date(),
  }),
  getServerUser: vi.fn().mockResolvedValue({
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}));

import ComparePage from '../../compare/page';
import AuditLogPage from '../audit-log/page';
import CapexManagementPage from '../capex/page';
import CurriculumTemplatesPage from '../curriculum-templates/page';
import AdminPage from '../page';
import RentTemplatesPage from '../rent-templates/page';
import WorkspaceSettingsPage from '../workspace/page';

describe('Admin dashboard pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render admin dashboard heading', async () => {
    const AdminPageComponent = await AdminPage();
    render(AdminPageComponent);

    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('should render audit log page', async () => {
    const AuditLogPageComponent = await AuditLogPage();
    render(AuditLogPageComponent);

    expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-viewer')).toBeInTheDocument();
  });

  it('should render capex management tabs', () => {
    render(<CapexManagementPage />);

    expect(screen.getByRole('heading', { name: 'Capex Management' })).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(capexCategoriesMock).toHaveBeenCalled();
    expect(capexRulesMock).toHaveBeenCalled();
  });

  it('should render curriculum templates page', () => {
    render(<CurriculumTemplatesPage />);

    expect(screen.getByRole('heading', { name: 'Curriculum Templates' })).toBeInTheDocument();
    expect(screen.getByTestId('curriculum-templates')).toBeInTheDocument();
  });

  it('should render rent templates page', () => {
    render(<RentTemplatesPage />);

    expect(screen.getByRole('heading', { name: 'Rent Templates' })).toBeInTheDocument();
    expect(screen.getByTestId('rent-templates')).toBeInTheDocument();
  });

  it('should render workspace settings page', async () => {
    const WorkspaceSettingsPageComponent = await WorkspaceSettingsPage();
    render(WorkspaceSettingsPageComponent);

    expect(screen.getByRole('heading', { name: 'Workspace Settings' })).toBeInTheDocument();
    expect(screen.getByTestId('workspace-settings')).toBeInTheDocument();
  });

  it('should render compare page', () => {
    render(<ComparePage />);

    expect(screen.getByRole('heading', { name: 'Compare Versions' })).toBeInTheDocument();
    expect(screen.getByTestId('comparison-view')).toBeInTheDocument();
  });
});
