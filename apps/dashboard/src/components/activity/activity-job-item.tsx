import { Route, ChevronDown } from 'lucide-react';
import { IActivityJob, IDelayRegularMetadata, IDigestRegularMetadata, JobStatusEnum, StepTypeEnum } from '@novu/shared';
import { Button } from '@/components/primitives/button';
import { Badge } from '@/components/primitives/badge';
import { Card, CardContent, CardHeader } from '../primitives/card';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/utils/ui';
import { ExecutionDetailItem } from './execution-detail-item';
import { STEP_TYPE_TO_ICON } from '../icons/utils';
import { STEP_TYPE_TO_COLOR } from '../../utils/color';
import { JOB_STATUS_CONFIG } from './constants';
import { TimeDisplayHoverCard } from '../time-display-hover-card';

interface ActivityJobItemProps {
  job: IActivityJob;
  isFirst: boolean;
  isLast: boolean;
}

export function ActivityJobItem({ job, isFirst, isLast }: ActivityJobItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative flex items-center gap-1">
      <div
        className={cn(
          'absolute left-[11px] h-[calc(100%+24px)] w-[1px] bg-neutral-200',
          isFirst ? 'top-[50%]' : 'top-0',
          isLast ? 'h-[50%]' : 'h-[calc(100%+24px)]',
          isFirst && isLast && 'bg-transparent'
        )}
      />

      <JobStatusIndicator status={job.status} />

      <Card className="border-1 flex-1 border border-neutral-200 p-1 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
        <CardHeader
          className="flex flex-row items-center justify-between bg-white p-2 px-1 hover:cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-1.5">
            <div
              className={`h-5 w-5 rounded-full border opacity-40 border-${STEP_TYPE_TO_COLOR[job.type as keyof typeof STEP_TYPE_TO_COLOR]}`}
            >
              <div
                className={`h-full w-full rounded-full bg-neutral-50 text-${STEP_TYPE_TO_COLOR[job.type as keyof typeof STEP_TYPE_TO_COLOR]} flex items-center justify-center`}
              >
                {getJobIcon(job.type)}
              </div>
            </div>
            <span className="text-foreground-950 text-xs capitalize">{formatJobType(job.type)}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-foreground-600 !mt-0 h-5 gap-0 p-0 leading-[12px] hover:bg-transparent"
          >
            Show more
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
          </Button>
        </CardHeader>

        {!isExpanded && (
          <CardContent className="rounded-lg bg-neutral-50 p-2">
            <div className="flex items-center justify-between">
              <span className="text-foreground-400 max-w-[300px] truncate pr-2 text-xs">{getStatusMessage(job)}</span>
              <Badge variant="soft" className="bg-foreground-50 shrink-0 px-2 py-0.5 text-[11px] leading-3">
                <TimeDisplayHoverCard date={new Date(job.updatedAt)}>
                  {format(new Date(job.updatedAt), 'MMM d yyyy, HH:mm:ss')}
                </TimeDisplayHoverCard>
              </Badge>
            </div>
          </CardContent>
        )}

        {isExpanded && <JobDetails job={job} />}
      </Card>
    </div>
  );
}

function formatJobType(type?: StepTypeEnum): string {
  return type?.replace(/_/g, ' ') || '';
}

function getStatusMessage(job: IActivityJob): string {
  if (job.status === JobStatusEnum.MERGED) {
    return 'Step merged with another execution';
  }

  if (job.status === JobStatusEnum.FAILED && job.executionDetails?.length > 0) {
    return job.executionDetails[job.executionDetails.length - 1].detail || 'Step execution failed';
  }

  switch (job.type?.toLowerCase()) {
    case StepTypeEnum.DIGEST:
      if (job.status === JobStatusEnum.COMPLETED) {
        return `Digested ${job.digest?.events?.length ?? 0} events for ${(job.digest as IDigestRegularMetadata)?.amount ?? 0} ${
          (job.digest as IDigestRegularMetadata)?.unit ?? ''
        }`;
      }
      if (job.status === JobStatusEnum.DELAYED) {
        return `Collecting Digest events for ${(job.digest as IDigestRegularMetadata)?.amount ?? 0} ${
          (job.digest as IDigestRegularMetadata)?.unit ?? ''
        }`;
      }
      return 'Digest failed';

    case StepTypeEnum.DELAY:
      if (job.status === JobStatusEnum.COMPLETED) {
        return 'Delay completed';
      }

      if (job.status === JobStatusEnum.DELAYED) {
        return (
          'Waiting for ' +
          (job.digest as IDelayRegularMetadata)?.amount +
          ' ' +
          (job.digest as IDelayRegularMetadata)?.unit
        );
      }

      return 'Delay failed';

    default:
      if (job.status === JobStatusEnum.COMPLETED) {
        return 'Message sent successfully';
      }
      if (job.status === JobStatusEnum.PENDING) {
        return 'Sending message';
      }

      return '';
  }
}

function getJobIcon(type?: StepTypeEnum) {
  const Icon = STEP_TYPE_TO_ICON[type?.toLowerCase() as keyof typeof STEP_TYPE_TO_ICON] ?? Route;

  return <Icon className="h-3.5 w-3.5" />;
}

function getJobColor(status: JobStatusEnum) {
  switch (status) {
    case JobStatusEnum.COMPLETED:
      return 'success';
    case JobStatusEnum.FAILED:
      return 'destructive';
    case JobStatusEnum.DELAYED:
      return 'warning';
    case JobStatusEnum.MERGED:
      return 'neutral-300';
    default:
      return 'neutral-300';
  }
}

function JobDetails({ job }: { job: IActivityJob }) {
  return (
    <div className="border-t border-neutral-100 p-4">
      <div className="flex flex-col gap-4">
        {job.executionDetails && job.executionDetails.length > 0 && (
          <div className="flex flex-col gap-2">
            {job.executionDetails.map((detail, index) => (
              <ExecutionDetailItem key={index} detail={detail} />
            ))}
          </div>
        )}
        {/*
        TODO: Missing backend support for digest events widget
        {job.type === 'digest' && job.digest?.events && (
          <ActivityDetailCard title="Digest Events" expandable={true} open>
            <div className="min-w-0 max-w-full font-mono">
              {job.digest.events.map((event: DigestEvent, index: number) => (
                <div key={index} className="group flex items-center gap-2 rounded-sm px-1 py-1.5 hover:bg-neutral-100">
                  <RiCheckboxCircleLine className="text-success h-4 w-4 shrink-0" />
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate text-xs text-neutral-500">{event.type}</span>
                    <span className="text-xs text-neutral-400">
                      {`${format(new Date(job.updatedAt), 'HH:mm')} UTC`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ActivityDetailCard>
        )} */}
      </div>
    </div>
  );
}

interface JobStatusIndicatorProps {
  status: JobStatusEnum;
}

function JobStatusIndicator({ status }: JobStatusIndicatorProps) {
  const { icon: Icon, animationClass } = JOB_STATUS_CONFIG[status] || JOB_STATUS_CONFIG[JobStatusEnum.PENDING];

  return (
    <div className="relative flex-shrink-0">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
        <div className={`text-${getJobColor(status)} flex items-center justify-center`}>
          <Icon className={cn('h-4 w-4', animationClass)} />
        </div>
      </div>
    </div>
  );
}
