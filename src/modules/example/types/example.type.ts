export interface ExampleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  username: string;
}

export interface ExampleFeatureViewItem {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  isLoading: boolean;
  buttonText: string;
  testID?: string;
  feedback?: { message: string; testID: string };
}
