import { ScrollView } from 'react-native';

import {
  ExampleBottomSpacing,
  ExampleFeatureSection,
  ExampleHeader,
  ExampleStatsSection,
  ExampleWelcome,
} from '@/modules/example/components';
import { useExampleController } from '@/modules/example/hooks/useExampleController';
import { ScreenContainer } from '@sohantalukder/rn-kit';

function Example() {
  const { features } = useExampleController();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ExampleHeader />
        <ExampleWelcome />
        <ExampleFeatureSection features={features} />
        <ExampleStatsSection />
        <ExampleBottomSpacing />
      </ScrollView>
    </ScreenContainer>
  );
}

export default Example;
