import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Opportunity } from '@/types/opportunity.types';

interface CompanyInfoSectionProps {
  opportunity: Opportunity;
}

export function CompanyInfoSection({ opportunity }: CompanyInfoSectionProps) {
  // Always show the section, even if company data is incomplete
  const company = opportunity.company;
  const responsibleUser = opportunity.responsibleUser;

  // If there's no company data at all, show a message
  if (!company) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="py-6">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay información de la empresa disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20">
            {company.logo ? (
              <>
                <img
                  key={`company-logo-${company._id}-${company.logo}`}
                  src={company.logo}
                  alt={company.name || 'Company logo'}
                  className="w-full h-full rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1"
                  onLoad={() => {
                    const fallback = document.querySelector(`[data-company-logo-fallback="${company._id}"]`) as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.querySelector(`[data-company-logo-fallback="${company._id}"]`) as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div
                  data-company-logo-fallback={company._id}
                  className="absolute inset-0 w-full h-full rounded-lg bg-primary/10 dark:bg-primary/20 items-center justify-center border border-slate-200 dark:border-slate-700"
                  style={{ display: 'none' }}
                >
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {company.name || 'Empresa'}
            </CardTitle>
            {company.sector && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {company.sector}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {company.description && (
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Descripción
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
              {company.description}
            </p>
          </div>
        )}

        {/* Company Details Grid */}
        {(company.nit ||
          company.address ||
          company.phone ||
          company.email) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.nit && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  NIT
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
                  {company.nit}
                </p>
              </div>
            )}
            {company.address && (
              <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary flex-shrink-0" />
                  Dirección
                </p>
                <p className="text-sm text-slate-900 dark:text-slate-100 break-words">
                  {company.address}
                </p>
              </div>
            )}
            {company.phone && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                  Teléfono
                </p>
                <a
                  href={`tel:${company.phone}`}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors break-all"
                >
                  {company.phone}
                </a>
              </div>
            )}
            {company.email && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
                  Correo electrónico
                </p>
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors break-all inline-block"
                >
                  {company.email}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              No hay información de contacto disponible
            </p>
          </div>
        )}

        {/* Responsible User Contact */}
        {responsibleUser && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contacto Responsable
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 break-words">
                {responsibleUser.name}
              </p>
              <a
                href={`mailto:${responsibleUser.email}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 break-all"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">{responsibleUser.email}</span>
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

