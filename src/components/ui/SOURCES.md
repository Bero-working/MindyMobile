# Nativecn sources

Button, Input and Skeleton adapt the MIT-licensed sources from
[Mobilecn-UI/nativecn-ui](https://github.com/Mobilecn-UI/nativecn-ui/tree/main/components), consulted 2026-10-17.

- Button: cva variants and label API; uses project tokens, PressableScale, loading/disabled guards and accessibility.
- Input: labelled TextInput layout; forwards the ref and adds project tokens, password toggle and error feedback.
- Skeleton: static token-based placeholder; omits the upstream infinite opacity loop for Reduce Motion.

ScreenState, CoverImage, Icon and PressableScale are project components under `components/common`.
No additional dependencies are used.

The upstream copyright notice and MIT license are preserved in `LICENSE.nativecn.txt`.
