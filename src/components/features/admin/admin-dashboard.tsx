/**
 * Admin dashboard component
 * Navigation hub for all admin features
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  BookOpen,
  Building2,
  Users,
  FileText,
  DollarSign,
} from 'lucide-react';

export function AdminDashboard(): JSX.Element {
  const adminSections = [
    {
      title: 'Workspace Settings',
      description: 'Configure currency, discount rate, CPI bounds, and timezone',
      href: '/admin/workspace',
      icon: Settings,
    },
    {
      title: 'Curriculum Templates',
      description: 'Manage curriculum templates with capacity, tuition, and CPI',
      href: '/admin/curriculum-templates',
      icon: BookOpen,
    },
    {
      title: 'Rent Templates',
      description: 'Create and manage rent model templates',
      href: '/admin/rent-templates',
      icon: DollarSign,
    },
    {
      title: 'Capex Rules',
      description: 'Configure capex categories and reinvestment rules',
      href: '/admin/capex',
      icon: Building2,
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Audit Log',
      description: 'View system activity and changes',
      href: '/admin/audit-log',
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adminSections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={section.href}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

