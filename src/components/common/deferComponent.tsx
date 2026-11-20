import { createElement, type ComponentType } from 'react';

/**
 * Defer native module evaluation until the first render, then reuse the same
 * component type so rerenders preserve its state. Declare outside render and
 * pass an inline require; a static import would evaluate the module eagerly.
 */
export function deferComponent<Props extends object>(
  load: () => ComponentType<Props>
): ComponentType<Props> {
  let Component: ComponentType<Props> | undefined;
  return function DeferredComponent(props: Props) {
    Component ??= load();
    return createElement(Component, props);
  };
}
