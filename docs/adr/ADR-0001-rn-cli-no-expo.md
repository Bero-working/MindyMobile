# ADR-0001: Dùng RN CLI, không dùng Expo

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Repo dựng từ boilerplate `@sohantalukder/react-native-boilerplate` (React Native 0.80 CLI). App cần module native:
`react-native-mmkv`, `react-native-config`, `@d11/react-native-fast-image`, `react-native-reanimated`, NetInfo.
Thư mục `android/`, `ios/` đã có và build bằng Gradle/Xcode (`build-release.sh`).

## Decision
MindyMobile dùng React Native CLI. Không thêm Expo SDK, không dùng gói `expo-*`. Component copy từ nguồn ngoài (ví dụ
nativecn) mà import `expo-*` thì phải thay bằng thư viện RN CLI tương đương.

## Alternatives
- Expo (managed hoặc prebuild): phải chuyển cấu trúc native và cách đọc env đang dùng; không có lợi ích đủ lớn so
  với chi phí chuyển.

## Consequences
+ Toàn quyền với code native, giữ nguyên boilerplate và script build hiện có.
- Tự lo nâng cấp RN, cấu hình native, CocoaPods. Build iOS cần macOS.
