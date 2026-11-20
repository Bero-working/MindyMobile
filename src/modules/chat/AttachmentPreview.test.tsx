import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { AttachmentPreview, formatFileSize } from './AttachmentPreview';

const image = {
  uri: 'file:///cache/134.png',
  name: '134.png',
  mime: 'image/png',
  size: 1_258_291,
};

it('formats attachment sizes', () => {
  expect(formatFileSize(900)).toBe('900 B');
  expect(formatFileSize(2048)).toBe('2 KB');
  expect(formatFileSize(1_258_291)).toBe('1.2 MB');
});

it('shows a ready image with its type, size and a remove button', () => {
  const onRemove = jest.fn();
  render(
    <AttachmentPreview
      file={image}
      status="ready"
      removeDisabled={false}
      onRemove={onRemove}
    />
  );
  expect(screen.getByTestId('chat-attachment-thumb-image')).toBeTruthy();
  expect(screen.getByText('134.png')).toBeTruthy();
  expect(screen.getByText('Sẵn sàng gửi')).toBeTruthy();
  expect(screen.getByText('PNG · 1.2 MB')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Bỏ tệp'));
  expect(onRemove).toHaveBeenCalledTimes(1);
});

it('shows a PDF tile and hides remove while uploading', () => {
  render(
    <AttachmentPreview
      file={{ ...image, name: 'bai-tap.pdf', mime: 'application/pdf' }}
      status="uploading"
      removeDisabled={false}
      onRemove={jest.fn()}
    />
  );
  expect(screen.getByTestId('chat-attachment-thumb-pdf')).toBeTruthy();
  expect(screen.getByText('Đang xử lý…')).toBeTruthy();
  expect(screen.queryByTestId('chat-attachment-remove')).toBeNull();
});
