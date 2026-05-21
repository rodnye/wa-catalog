import { resolveUrl } from '@/utils/helpers';
import type { AnchorHTMLAttributes } from 'preact';

type Props = AnchorHTMLAttributes & { href: string };

export default function BaseLink({ href, ...props }: Props) {
  return <a href={resolveUrl(href)} {...props} />;
}
