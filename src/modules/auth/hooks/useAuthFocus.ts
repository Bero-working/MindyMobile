import { useRef } from 'react';
import { findNodeHandle, type ScrollView, type TextInput } from 'react-native';

export function useAuthFocus<Field extends string>() {
  const refs = useRef<Partial<Record<Field, TextInput | null>>>({});
  const scrollRef = useRef<ScrollView>(null);
  const focus = (field: Field) => {
    const input = refs.current[field];
    if (!input) return;
    input.focus();
    const handle = findNodeHandle(input);
    if (handle)
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        handle,
        20,
        true
      );
  };
  return { refs, scrollRef, focus };
}
