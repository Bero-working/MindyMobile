import { Script } from 'vm';
import { materialHtml, scriptValue } from './materialHtml';

it.each([
  '</script><script>alert(1)</script>',
  '<img src="https://untrusted.test/tracker" onerror="alert(1)">',
  '<style>body{display:none}</style><p>Xin chào\u2028React\u2029</p>',
])(
  'embeds API HTML as data without escaping the trusted script: %s',
  (content) => {
    const html = materialHtml(content);
    expect(html.match(/<script /g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain(content);
    expect(JSON.parse(scriptValue(content))).toBe(content);
    const script = html.match(/<script nonce="mindy">([\s\S]*)<\/script>/)?.[1];
    expect(script).toBeDefined();
    expect(() => new Script(script ?? '')).not.toThrow();
  }
);

it('creates valid player code without embedding storage capabilities', () => {
  const html = materialHtml(null, true);
  const script = html.match(/<script nonce="mindy">([\s\S]*)<\/script>/)?.[1];
  expect(() => new Script(script ?? '')).not.toThrow();
  expect(html).toContain("player.preload='metadata'");
  expect(html).not.toContain('https://');
});
