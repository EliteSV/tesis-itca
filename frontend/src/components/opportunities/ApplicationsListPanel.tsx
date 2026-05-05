import type { ApplicationWithOpportunity, Opportunity } from '@/types/opportunity.types';
import { ApplicationListItem } from './ApplicationListItem';

interface ApplicationsListPanelProps {
  applications?: ApplicationWithOpportunity[];
  opportunities?: Opportunity[];
  selectedApplicationId: string | null;
  selectedOpportunityId: string | null;
  onSelectApplication: (application: ApplicationWithOpportunity) => void;
  onSelectOpportunity: (opportunityId: string) => void;
  getTimeAgo: (date: string) => string;
}

export function ApplicationsListPanel({
  applications,
  opportunities,
  selectedApplicationId,
  selectedOpportunityId,
  onSelectApplication,
  onSelectOpportunity,
  getTimeAgo,
}: ApplicationsListPanelProps) {
  return (
    <div>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
        {applications
          ? applications.map((application) => (
              <ApplicationListItem
                key={application._id}
                application={application}
                isSelected={selectedApplicationId === application._id}
                onSelect={() => onSelectApplication(application)}
                getTimeAgo={getTimeAgo}
              />
            ))
          : opportunities?.map((opportunity) => (
              <ApplicationListItem
                key={opportunity._id}
                opportunity={opportunity}
                isSelected={selectedOpportunityId === opportunity._id}
                onSelect={() => onSelectOpportunity(opportunity._id)}
                getTimeAgo={getTimeAgo}
                createdAt={opportunity.createdAt}
              />
            ))}
      </div>
    </div>
  );
}

