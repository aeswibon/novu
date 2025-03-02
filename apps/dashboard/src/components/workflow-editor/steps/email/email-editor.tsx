import { Separator } from '@/components/primitives/separator';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { EmailPreviewHeader } from '@/components/workflow-editor/steps/email/email-preview';
import { EmailTabsSection } from '@/components/workflow-editor/steps/email/email-tabs-section';
import { type UiSchema } from '@novu/shared';

const subjectKey = 'subject';
const emailEditorKey = 'emailEditor';

type EmailEditorProps = { uiSchema: UiSchema };
export const EmailEditor = (props: EmailEditorProps) => {
  const { uiSchema } = props;
  const { [emailEditorKey]: emailEditor, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <EmailTabsSection>
        <EmailPreviewHeader />
      </EmailTabsSection>
      <EmailTabsSection className="-mx-[2px] -my-[3px] px-7 py-2">
        {getComponentByType({ component: subject.component })}
      </EmailTabsSection>
      <Separator className="bg-neutral-100" />
      {/* extra padding on the left to account for the drag handle */}
      <EmailTabsSection className="basis-full pl-14">
        {emailEditor && getComponentByType({ component: emailEditor.component })}
      </EmailTabsSection>
    </div>
  );
};
