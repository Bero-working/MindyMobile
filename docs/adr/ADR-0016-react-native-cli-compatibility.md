# ADR-0016: Đồng bộ React Native CLI với React Native 0.80

- Status: Accepted
- Date: 2026-10-17
- Author: @Bero (triển khai với Codex)
- Approved by: @Bero (xác nhận trực tiếp trong chat 2026-10-17)

## Context
Phase 0 chạy `android/gradlew.bat assembleDebug` nhưng lỗi `Project with path ':react-native-config' could not be found`.
CLI 15 hiện có không nhận package Android kế thừa `BaseReactPackage` của `react-native-config` 1.7.2:
`react-native config` trả `platforms.android: null`, dù source package có trong node_modules.
React Native 0.80 cần CLI tương thích (bảng upstream: CLI 19 cho RN 0.80).

## Decision
- Đồng bộ ba devDependency `@react-native-community/cli`, `cli-platform-android`, `cli-platform-ios` sang major 19.
- Không sửa trực tiếp node_modules, không thêm manual linking trùng với autolinking.
- Cài lại dependency, tái tạo cache autolinking trong android/build, kiểm tra `react-native config` và build Android.
- Giữ nguyên version React Native, React và các native module.

## Alternatives
- Manual linking `react-native-config`: che lỗi CLI cũ, các module `BaseReactPackage` khác vẫn có thể bị bỏ sót.
- Sửa node_modules: không tái lập được sau `npm ci`.

## Consequences
Sửa package.json, package-lock.json và cập nhật ARCHITECTURE.md cùng thay đổi.
Đây là sửa cấu hình nền cũ phát hiện khi nghiệm thu Phase 0, cần owner Accepted theo B.8 trước khi thực hiện.

## References
- https://github.com/react-native-community/cli#compatibility
