import type {
  ApplicationWithOpportunity,
  Opportunity,
} from '@/types/opportunity.types';
import { ApplicationsListPanel } from './ApplicationsListPanel';
import { JobDetailPanel } from './JobDetailPanel';

interface ApplicationsContentProps {
  applications?: ApplicationWithOpportunity[];
  opportunities?: Opportunity[];
  selectedApplication: ApplicationWithOpportunity | null;
  selectedOpportunityId: string | null;
  displayedOpportunity: Opportunity | null;
  onSelectApplication: (application: ApplicationWithOpportunity) => void;
  onSelectOpportunity: (opportunityId: string) => void;
  getTimeAgo: (date: string) => string;
}

export function ApplicationsContent({
  applications,
  opportunities,
  selectedApplication,
  selectedOpportunityId,
  displayedOpportunity,
  onSelectApplication,
  onSelectOpportunity,
  getTimeAgo,
}: ApplicationsContentProps) {
  if (displayedOpportunity) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[400px_1fr] gap-3 sm:gap-4">
        <ApplicationsListPanel
          applications={applications}
          opportunities={opportunities}
          selectedApplicationId={selectedApplication?._id || null}
          selectedOpportunityId={selectedOpportunityId}
          onSelectApplication={onSelectApplication}
          onSelectOpportunity={onSelectOpportunity}
          getTimeAgo={getTimeAgo}
        />
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden border-t-2 border-t-secondary/20">
          <JobDetailPanel
            opportunity={displayedOpportunity}
            onApply={() => {}}
            getTimeAgo={getTimeAgo}
            hideAppliedMessage={true}
          />
        </div>
      </div>
    );
  }

  return (
    <ApplicationsListPanel
      applications={applications}
      opportunities={opportunities}
      selectedApplicationId={selectedApplication?._id || null}
      selectedOpportunityId={selectedOpportunityId}
      onSelectApplication={onSelectApplication}
      onSelectOpportunity={onSelectOpportunity}
      getTimeAgo={getTimeAgo}
    />
  );
}

