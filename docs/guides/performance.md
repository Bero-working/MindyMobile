# Performance

Quy tắc tối ưu render, danh sách và tác vụ nặng. Đọc khi làm danh sách, màn hình nhiều ảnh/animation hoặc xử lý dữ
liệu lớn.

## Quy tắc

- **Dùng `React.memo()` cho component tốn kém**: item của list, component có ảnh/animation, component nhận props
  ổn định nhưng cha re-render thường xuyên. Không memo component nhỏ, rẻ.
- **Dùng `useMemo()` và `useCallback()` cho tính toán nặng**: lọc/sắp xếp/nhóm danh sách (lịch học theo ngày),
  callback truyền vào component đã memo hoặc vào `renderItem`. Dependency phải đầy đủ.
- **Tối ưu `FlatList` bằng `getItemLayout` và `keyExtractor`**:
  - `keyExtractor` trả `id` từ API. **KHÔNG** dùng index làm key.
  - Item cao cố định → khai báo `getItemLayout`.
  - `renderItem`, `keyExtractor`, `getItemLayout` khai báo ngoài component hoặc bọc `useCallback`.
  - Danh sách dài hoặc item cao không đều → dùng `FlashList` với `estimatedItemSize`.
  - Không lồng `FlatList` dọc trong `ScrollView` dọc.
- **Dùng `InteractionManager` cho tác vụ nặng**: xử lý dữ liệu lớn (dựng lưới lịch, parse nội dung material dài)
  chạy sau khi animation chuyển màn hình xong. Huỷ task khi unmount.
- Zustand: luôn lấy state qua selector (`useStore((s) => s.auth.user)`), không lấy cả store.
- TanStack Query: dùng `select` để component chỉ re-render khi phần nó cần thay đổi.
- Ảnh: tải đúng kích thước hiển thị, dùng cache của FastImage.
- Kiểm tra bằng Perf Monitor trong Dev Menu (FPS UI/JS) trước khi tối ưu thêm.

## Ví dụ

```tsx
const ITEM_HEIGHT = 88;

const keyExtractor = (item: ClassSummary): string => item.id;

const getItemLayout = (
  _data: ArrayLike<ClassSummary> | null | undefined,
  index: number
) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index });

export function ClassList({ classes, onOpen }: ClassListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ClassSummary>) => (
      <ClassRow
        item={item}
        onPress={onOpen}
      />
    ),
    [onOpen]
  );

  return (
    <FlatList
      data={classes}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
    />
  );
}

const ClassRow = memo(function ClassRow({ item, onPress }: ClassRowProps) {
  // ...
});
```

```ts
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    setScheduleGrid(buildScheduleGrid(sessions, timeZone));
  });
  return () => task.cancel();
}, [sessions, timeZone]);
```
