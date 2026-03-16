import { useAppStore } from '@/lib/store';
import { Onboarding } from '@/components/Onboarding';
import { ChatLayout } from '@/components/ChatLayout';

const Index = () => {
  const onboarded = useAppStore((s) => s.profile.onboarded);

  if (!onboarded) {
    return <Onboarding />;
  }

  return <ChatLayout />;
};

export default Index;
